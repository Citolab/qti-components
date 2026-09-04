import { consume, provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import { computedContext } from '@qti-components/base';
import { configContext } from '@qti-components/base';
import { testContext } from '@qti-components/base';
import { sessionContext } from '@qti-components/base';
import { qtiContext } from '@qti-components/base';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiContext } from '@qti-components/base';
import type { OutcomeVariable } from '@qti-components/base';
import type { ComputedContext, ComputedItem } from '@qti-components/base';
import type { PropertyValues } from 'lit';
import type { QtiAssessmentItemRef } from '../qti-assessment-item-ref/qti-assessment-item-ref';
import type { QtiAssessmentSection } from '../qti-assessment-section/qti-assessment-section';
import type { QtiAssessmentTest } from '../qti-assessment-test/qti-assessment-test';
import type { QtiTestPart } from '../qti-test-part/qti-test-part';
import type { QtiItemSessionControl } from '../qti-item-session-control/qti-item-session-control';
import type { ConfigContext } from '@qti-components/base';
import type { SessionContext } from '@qti-components/base';
import type { TestContext } from '@qti-components/base';
import type { ItemContext } from '@qti-components/base';
import type { ResponseVariable } from '@qti-components/base';

type CustomEventMap = {
  'test-end-attempt': CustomEvent;
};

declare global {
  interface GlobalEventHandlersEventMap extends CustomEventMap {}
}

/**
 * Whether an item's ended attempt reached the best achievable outcome:
 * 'optimal' (nothing to improve), 'suboptimal' (a better attempt is possible),
 * or 'unscored' (no machine-judgeable optimal value — see #assessOptimality).
 */
type ItemOptimality = 'optimal' | 'suboptimal' | 'unscored';

export class TestNavigation extends LitElement {
  @property({ type: String }) identifier: string | undefined = undefined;

  @state()
  public initContext: { identifier: string; [key: string]: any }[] = [];

  @state()
  @provide({ context: qtiContext })
  public qtiContext: QtiContext = {
    QTI_CONTEXT: {
      testIdentifier: '',
      candidateIdentifier: '',
      environmentIdentifier: 'default'
    }
  };

  @state()
  @consume({ context: configContext, subscribe: true })
  public configContext: ConfigContext = {};

  @state()
  @consume({ context: testContext, subscribe: true })
  protected _testContext?: TestContext;

  @state()
  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @state()
  @provide({ context: computedContext })
  protected computedContext: ComputedContext;

  @property({ type: Boolean, attribute: 'auto-score-items' }) autoScoreItems = false;

  #testElement: QtiAssessmentTest;

  /**
   * Whether each item's last *ended attempt* reached the optimal outcome, keyed
   * by item-ref id. Written from #handleItemContextUpdated when processResponse
   * ends an attempt — never on a plain selection. Mirrors how inline feedback
   * only re-evaluates when an attempt is processed, so a freshly-picked answer
   * doesn't flip `done` until the candidate ends the attempt.
   */
  #optimality = new Map<string, ItemOptimality>();

  constructor() {
    super();
    this.addEventListener('qti-assessment-test-connected', this.#handleTestConnected.bind(this));
    this.addEventListener('qti-assessment-item-connected', this.#handleItemConnected.bind(this));

    this.addEventListener('qti-interaction-changed', this.#handleInteractionChanged.bind(this));
    this.addEventListener('qti-item-context-updated', this.#handleItemContextUpdated.bind(this));

    this.addEventListener('test-end-attempt', this.#handleTestEndAttempt.bind(this));
    this.addEventListener('test-update-outcome-variable', this.#handleTestUpdateOutcomeVariable.bind(this));
  }

  /**
   * Latch whether an item reached its optimal outcome whenever it has just ended
   * an attempt. processResponse — fired by test-end-attempt, autoscore, or an
   * in-item end-attempt interaction — flags its context update with
   * `responseProcessed`; a plain selection updates the context without it, so
   * `done` can't flip until the candidate actually ends the attempt.
   */
  #handleItemContextUpdated(event: CustomEvent<{ itemContext: ItemContext; responseProcessed?: boolean }>) {
    if (!event.detail?.responseProcessed) return;
    const itemContext = event.detail.itemContext;
    if (!itemContext?.identifier) return;
    const optimality = this.#assessOptimality(itemContext);
    this.#optimality.set(itemContext.identifier, optimality);

    const computedItem = this.computedItemFor(itemContext.identifier);
    const numAttempts = Number(itemContext.variables?.find(v => v.identifier === 'numAttempts')?.value) || 0;
    this.afterAttemptEnded(
      (event.composedPath()[0] as HTMLElement)?.closest<QtiAssessmentItem>('qti-assessment-item'),
      computedItem,
      this.#isItemDone(numAttempts, optimality, computedItem?.maxAttempts)
    );
  }

  /**
   * Extension point for presentation packages reacting to an ended attempt.
   * `done` is settled here — from the freshly latched optimality and the
   * session-control cascade — because the computed context only catches up on
   * the next update, after this event has finished bubbling.
   */
  protected afterAttemptEnded(
    _assessmentItem: QtiAssessmentItem | undefined,
    _computedItem: ComputedItem | undefined,
    _done: boolean
  ): void {}

  /** The computed-context entry for an item, from the session-control cascade. */
  protected computedItemFor(identifier: string): ComputedItem | undefined {
    return this.computedContext?.testParts
      ?.flatMap(part => part.sections)
      .flatMap(section => section.items)
      .find(i => i.identifier === identifier);
  }

  /** The assessment item for an item-ref id, if it has been rendered. */
  #assessmentItemFor(identifier: string | undefined): QtiAssessmentItem | undefined {
    if (!identifier) return undefined;
    const itemRef = this.#testElement?.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${identifier}"]`
    );
    return itemRef?.assessmentItem ?? undefined;
  }

  /** The currently active assessment item, exposed for optional presentation extensions. */
  protected get activeAssessmentItem(): QtiAssessmentItem | undefined {
    if (!this.#testElement || !this._sessionContext?.navItemRefId) return undefined;
    return this.#testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${this._sessionContext.navItemRefId}"]`
    )?.assessmentItem;
  }

  /**
   * Handles the 'test-end-attempt' event.
   * @private
   * @listens TestNavigation#test-end-attempt
   * @param {CustomEvent} event - The custom event object.
   */
  #handleTestEndAttempt(_event: CustomEvent) {
    const qtiAssessmentItemEl = this.activeAssessmentItem;
    if (!qtiAssessmentItemEl) return;
    const reportValidityAfterScoring = this.configContext?.reportValidityAfterScoring === true ? true : false;
    qtiAssessmentItemEl.processResponse(true, reportValidityAfterScoring);
  }

  #handleTestUpdateOutcomeVariable(event: CustomEvent) {
    const qtiAssessmentItemEl = this.#assessmentItemFor(event.detail?.assessmentItemRefId);
    if (!qtiAssessmentItemEl) return;
    qtiAssessmentItemEl.setOutcomeVariable(event.detail.outcomeVariableId, event.detail.value);
  }

  #handleInteractionChanged(_event: CustomEvent) {
    if (this.autoScoreItems) {
      const assessmentItem = (_event.composedPath()[0] as HTMLElement).closest<QtiAssessmentItem>(
        'qti-assessment-item'
      );
      // Autoscoring resolves the item from the event's own path, so a change
      // raised outside an assessment item has nothing to score.
      if (!assessmentItem) return;
      const scoreOutcomeIdentifier = assessmentItem.variables.find(v => v.identifier === 'SCORE') as OutcomeVariable;
      if (
        scoreOutcomeIdentifier &&
        scoreOutcomeIdentifier.externalScored === null &&
        assessmentItem.adaptive === 'false'
      ) {
        const reportValidityAfterScoring = this.configContext?.reportValidityAfterScoring === true ? true : false;
        assessmentItem.processResponse(true, reportValidityAfterScoring);
      }
    }
  }

  override render() {
    // return this.myTemplate ? this.myTemplate(this.stampContext) : nothing;
    return html`<slot></slot>`;
  }

  /* PK: on test connected we can build the computed context */
  #handleTestConnected(event: CustomEvent) {
    this.#testElement = event.detail as QtiAssessmentTest;
    // A fresh test invalidates the per-test optimality latches.
    this.#optimality.clear();
    // Set the testIdentifier in qtiContext if not already set
    if (!this.qtiContext.QTI_CONTEXT?.testIdentifier) {
      const currentContext = this.qtiContext.QTI_CONTEXT || {
        testIdentifier: '',
        candidateIdentifier: 'not set',
        environmentIdentifier: 'default'
      };
      this.qtiContext = {
        QTI_CONTEXT: {
          ...currentContext,
          testIdentifier: this.#testElement.identifier,
          environmentIdentifier: currentContext.environmentIdentifier || 'default'
        }
      };
    }

    // Process qti-context-declaration elements to get default values
    const contextDeclarations = this.#testElement.querySelectorAll('qti-context-declaration[identifier="QTI_CONTEXT"]');

    contextDeclarations.forEach(declaration => {
      const defaultValues = this.#extractDefaultValues(declaration);
      if (Object.keys(defaultValues).length > 0) {
        // Merge default values with current context, but don't override existing runtime values
        this.qtiContext = {
          QTI_CONTEXT: {
            ...defaultValues, // Default values first
            ...this.qtiContext.QTI_CONTEXT // Runtime values override defaults
          }
        };
      }
    });

    const testPartElements = Array.from(this.#testElement?.querySelectorAll<QtiTestPart>(`qti-test-part`) || []);
    this.computedContext = {
      identifier: this.#testElement.identifier,
      title: this.#testElement.title,
      view: this._sessionContext?.view,
      testParts: testPartElements.map(testPart => {
        const sectionElements = [...testPart.querySelectorAll<QtiAssessmentSection>(`qti-assessment-section`)];
        const testPartSessionControl = testPart.querySelector<QtiItemSessionControl>(
          ':scope > qti-item-session-control'
        );
        const partAllowSkipping = testPartSessionControl ? testPartSessionControl.allowSkipping : true;
        const partMaxAttempts = testPartSessionControl ? testPartSessionControl.maxAttempts : 1;
        const partShowFeedback = testPartSessionControl ? testPartSessionControl.showFeedback : false;
        const partShowSolution = testPartSessionControl ? testPartSessionControl.showSolution : false;
        return {
          active: false,
          identifier: testPart.identifier,
          navigationMode: testPart.navigationMode,
          submissionMode: testPart.submissionMode,
          allowSkipping: partAllowSkipping,
          sections: sectionElements.map(section => {
            const itemElements = [...section.querySelectorAll<QtiAssessmentItemRef>(`qti-assessment-item-ref`)];
            const sectionSessionControl = section.querySelector<QtiItemSessionControl>(
              ':scope > qti-item-session-control'
            );
            const sectionAllowSkipping = sectionSessionControl
              ? sectionSessionControl.allowSkipping
              : partAllowSkipping;
            const sectionMaxAttempts = sectionSessionControl ? sectionSessionControl.maxAttempts : partMaxAttempts;
            const sectionShowFeedback = sectionSessionControl ? sectionSessionControl.showFeedback : partShowFeedback;
            const sectionShowSolution = sectionSessionControl ? sectionSessionControl.showSolution : partShowSolution;
            return {
              active: false,
              identifier: section.identifier,
              title: section.title,
              navigationMode: section.navigationMode,
              submissionMode: section.submissionMode,
              allowSkipping: sectionAllowSkipping,
              items: itemElements.map(item => {
                const itemSessionControl = item.querySelector<QtiItemSessionControl>(
                  ':scope > qti-item-session-control'
                );
                const itemAllowSkipping = itemSessionControl ? itemSessionControl.allowSkipping : sectionAllowSkipping;
                const itemMaxAttempts = itemSessionControl ? itemSessionControl.maxAttempts : sectionMaxAttempts;
                const itemShowFeedback = itemSessionControl ? itemSessionControl.showFeedback : sectionShowFeedback;
                const itemShowSolution = itemSessionControl ? itemSessionControl.showSolution : sectionShowSolution;
                return {
                  ...this.initContext?.find(i => i.identifier === item.identifier),
                  active: false,
                  identifier: item.identifier,
                  categories: item.category ? item.category?.split(' ') : [],
                  href: item.href,
                  variables: [] as OutcomeVariable[],
                  allowSkipping: itemAllowSkipping,
                  maxAttempts: itemMaxAttempts,
                  showFeedback: itemShowFeedback,
                  showSolution: itemShowSolution
                };
              })
            };
          })
        };
      })
    };
  }

  /**
   * Extract default values from a qti-context-declaration element
   */
  #extractDefaultValues(declaration: Element): Record<string, any> {
    const defaultValues: Record<string, any> = {};

    const defaultValueElement = declaration.querySelector('qti-default-value');
    if (!defaultValueElement) {
      return defaultValues;
    }

    const valueElements = defaultValueElement.querySelectorAll('qti-value[field-identifier]');
    valueElements.forEach(valueElement => {
      const fieldIdentifier = valueElement.getAttribute('field-identifier');
      const baseType = valueElement.getAttribute('base-type') || 'string';
      const textContent = valueElement.textContent?.trim() || '';

      if (fieldIdentifier) {
        // Convert value based on base-type
        let value: any = textContent;
        switch (baseType) {
          case 'integer':
            value = parseInt(textContent, 10);
            break;
          case 'float':
          case 'duration':
            value = parseFloat(textContent);
            break;
          case 'boolean':
            value = textContent.toLowerCase() === 'true';
            break;
          case 'string':
          default:
            value = textContent;
            break;
        }

        defaultValues[fieldIdentifier] = value;
      }
    });

    return defaultValues;
  }

  /* PK: on item connected we can add item only properties in the xml */
  #handleItemConnected(event: CustomEvent) {
    const itemElement = event.detail as QtiAssessmentItem;

    this.computedContext = {
      ...this.computedContext,
      testParts: this.computedContext.testParts.map(testPart => {
        return {
          ...testPart,
          sections: testPart.sections.map(section => {
            return {
              ...section,
              items: section.items.map(item => {
                if (item.identifier !== itemElement.parentElement.getAttribute('identifier')) {
                  return item;
                }

                const scoreOutcome = itemElement.querySelector<HTMLElement>(
                  "qti-outcome-declaration[identifier='SCORE']"
                );
                // const scoreOutcome = item.variables.find(vr => vr.identifier == 'SCORE') as OutcomeVariable;
                const externalScored = scoreOutcome?.getAttribute('externalScored');

                const responseDeclarations = itemElement.querySelectorAll<HTMLElement>('qti-response-declaration');
                const containsCorrectResponse = Array.from(responseDeclarations).some((r: HTMLElement) =>
                  r.querySelector('qti-correct-response')
                );
                // check if every responseDeclaration has a correctResponse
                const containsMapping = Array.from(responseDeclarations).some((r: HTMLElement) => {
                  const mapping = r.querySelector('qti-mapping');
                  const areaMapping = r.querySelector('qti-area-mapping');
                  return mapping?.querySelector('qti-map-entry') || areaMapping?.querySelector('qti-area-map-entry');
                });

                const hasCorrectResponse = containsCorrectResponse || containsMapping;

                const hasResponseProcessing = itemElement.querySelector('qti-response-processing') ? true : false;

                return {
                  ...item,
                  assessmentItemIdentifier: itemElement.getAttribute('identifier'),
                  label: itemElement.getAttribute('label'),
                  title: itemElement.title,
                  externalScored,
                  adaptive: itemElement.adaptive == 'true' || false,
                  timeDependent: itemElement.timeDependent == 'true' || false,
                  variables: itemElement.variables,
                  hasCorrectResponse,
                  hasResponseProcessing
                };
              })
            };
          })
        };
      })
    };
  }

  /* PK: on every change of the candidate we will recomputed the computedContext */
  protected override willUpdate(_changedProperties: PropertyValues): void {
    if (!this.computedContext) return;

    let itemIndex = 1;
    this.computedContext = {
      ...this.computedContext,
      view: this._sessionContext?.view,
      testParts: this.computedContext.testParts.map(testPart => {
        return {
          ...testPart,
          active: this._sessionContext?.navPartId === testPart.identifier || false,
          sections: testPart.sections.map(section => {
            return {
              ...section,
              active: this._sessionContext?.navSectionId === section.identifier || false,
              completed: section.items.every(
                item =>
                  this._testContext.items
                    .find(i => i.identifier === item.identifier)
                    ?.variables.find(v => v.identifier === 'completionStatus').value === 'completed'
              ),

              items: section.items.map(item => {
                const itemContext = this._testContext?.items.find(i => i.identifier === item.identifier);
                const computedItem = {
                  ...item,
                  ...itemContext,
                  ...this.initContext?.find(i => i.identifier === item.identifier)
                };

                const rawscore = computedItem.variables?.find(vr => vr.identifier == 'SCORE')?.value;

                const score = rawscore === undefined || rawscore === null ? null : parseFloat(rawscore?.toString());

                const completionStatus = computedItem.variables?.find(v => v.identifier === 'completionStatus')
                  ?.value as string;

                const response = computedItem.variables?.find(v => v.identifier === 'RESPONSE')?.value || '';
                const numAttempts =
                  Number(computedItem.variables?.find(v => v.identifier === 'numAttempts')?.value) || 0;

                const active = this._sessionContext?.navItemRefId === computedItem.identifier || false;

                const valid = this.#assessmentItemFor(computedItem.identifier)?.validate(false) ?? true;

                const responseVars = itemContext?.variables?.filter(v => v.type === 'response') || [];

                const isDefaultResponse = responseVars.every(v => {
                  if (v.value === undefined || v.value === null) {
                    return true;
                  }
                  let fallbackValue: string;
                  switch (v.baseType) {
                    case 'integer':
                    case 'float':
                    case 'duration':
                      fallbackValue = '0';
                      break;
                    case 'boolean':
                      fallbackValue = 'false';
                      break;
                    case 'string':
                    case 'directedPair':
                    case 'identifier':
                    case 'pair':
                    case 'record':
                    default:
                      fallbackValue = '';
                      break;
                  }

                  const defaultValue = v.defaultValue ?? fallbackValue;

                  if (Array.isArray(v.value)) {
                    const dv = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
                    return v.value.length === dv.length && v.value.every((val, i) => val === dv[i]);
                  }

                  return v.value === defaultValue;
                });

                // Computed and opiniated
                // const type = item.categories.includes(this.configContext?.infoItemCategory) ? 'info' : 'regular';
                // const correct = (type == 'regular' && score !== undefined && !isNaN(score) && score > 0) || false;
                // const incorrect = (type == 'regular' && score !== undefined && !isNaN(score) && score <= 0) || false;
                // const completed = completionStatus === 'completed';

                const index = item.categories.includes(this.configContext?.infoItemCategory) ? null : itemIndex++;
                const rawMaxScore = item.variables?.find(vr => vr.identifier == 'MAXSCORE')?.value;
                const maxScore =
                  rawMaxScore === undefined || rawMaxScore === null ? null : parseFloat(rawMaxScore?.toString());

                // Optimality comes from the last *ended attempt* (#optimality),
                // latched in #handleItemContextUpdated — never from a live
                // mid-attempt selection. On a restored session no attempt is ended
                // this run, so seed it once from the persisted context, which still
                // holds the submitted response.
                let optimality = this.#optimality.get(computedItem.identifier);
                if (optimality === undefined) {
                  optimality = itemContext ? this.#assessOptimality(itemContext) : 'unscored';
                  if (numAttempts > 0) this.#optimality.set(computedItem.identifier, optimality);
                }

                const done = this.#isItemDone(numAttempts, optimality, computedItem.maxAttempts);

                return {
                  ...computedItem,
                  completionStatus,
                  numAttempts,
                  score,
                  response,
                  index,
                  active,
                  valid,
                  isDefaultResponse,
                  maxScore,
                  done,
                  // Reflects the last *ended* attempt only. Read the latch directly
                  // (not the `optimality` local) — the latch is written solely on
                  // responseProcessed / restore-seed (line above, guarded by
                  // numAttempts > 0), so a freshly-picked mid-attempt selection
                  // computed live is never stored and never counts as optimal.
                  optimal: this.#optimality.get(computedItem.identifier) === 'optimal'
                  // type,
                  // correct,
                  // incorrect,
                  // completed
                };
              })
            };
          })
        };
      })
    };

    this.dispatchEvent(
      new CustomEvent('qti-computed-context-updated', {
        detail: this.computedContext,
        bubbles: true
      })
    );
  }

  /**
   * Decide whether an item should be treated as "the candidate is done with it"
   * for the purpose of gating forward navigation and further attempts.
   *
   * - The candidate must have actually ended an attempt (numAttempts > 0).
   * - Once attempted, the item is done if they reached the optimal outcome
   *   ('optimal'), or there's nothing to improve on ('unscored'). It is only *not*
   *   done while a better attempt is still possible ('suboptimal') and attempts
   *   remain — see #assessOptimality for how "optimal" is determined.
   *
   * `optimality` reflects the last *ended attempt* (see #optimality), not the
   * live selection — so a freshly-picked optimal answer doesn't count as done
   * until test-end-attempt evaluates it.
   */
  #isItemDone(numAttempts: number, optimality: ItemOptimality, maxAttempts: number | undefined): boolean {
    if (numAttempts === 0) return false;
    if (optimality !== 'suboptimal') return true;
    const max = maxAttempts ?? 1;
    return max > 0 && numAttempts >= max;
  }

  /**
   * Decide whether an item's submission is as good as it can get — i.e. the
   * candidate reached the *optimal* outcome, so there's no reason to make them
   * try again. 'optimal' means best achievable, 'suboptimal' means a better
   * attempt is still possible, 'unscored' means there's nothing to judge against.
   * ("optimal" is the spec's own word — a qti-correct-response is defined as
   * "the (or an) optimal value".)
   *
   * Two signals, in order of authority:
   *  1. The scored outcome: optimal ⟺ SCORE has reached its maximum (MAXSCORE).
   *     This correctly handles partial-credit / qti-mapping items, where an exact
   *     response match would under- or over-judge.
   *  2. The declared qti-correct-response, for items that aren't scored (no
   *     SCORE/MAXSCORE) — an exact match is the best available proxy. Bookkeeping
   *     variables like numAttempts can be typed 'response' but never declare a
   *     correctResponse, so we filter on a declared correctResponse.
   *
   * Items with neither a comparable score nor a correctResponse (essays, info
   * items, etc.) are 'unscored' — there's no optimal value to require, so one
   * attempt is enough.
   */
  #assessOptimality(item: ItemContext): ItemOptimality {
    const variables = item.variables ?? [];

    const score = this.#numericVariable(variables, 'SCORE');
    const maxScore = this.#numericVariable(variables, 'MAXSCORE');
    if (score !== null && maxScore !== null) {
      return score >= maxScore ? 'optimal' : 'suboptimal';
    }

    const responseVars = variables.filter(
      (v): v is ResponseVariable =>
        v.type === 'response' &&
        (v as ResponseVariable).correctResponse !== undefined &&
        (v as ResponseVariable).correctResponse !== null
    );
    if (responseVars.length === 0) return 'unscored';
    const allMatch = responseVars.every(v => {
      const expected = v.correctResponse;
      const actual = v.value;
      if (actual === undefined || actual === null) return false;
      if (Array.isArray(expected) && Array.isArray(actual)) {
        return expected.length === actual.length && expected.every(e => actual.includes(e));
      }
      if (Array.isArray(expected) || Array.isArray(actual)) return false;
      return expected === actual;
    });
    return allMatch ? 'optimal' : 'suboptimal';
  }

  /** Read a single numeric outcome value, or null when absent / non-numeric. */
  #numericVariable(variables: ItemContext['variables'], identifier: string): number | null {
    const raw = variables?.find(v => v.identifier === identifier)?.value;
    if (raw === undefined || raw === null || Array.isArray(raw)) return null;
    const parsed = parseFloat(raw.toString());
    return Number.isNaN(parsed) ? null : parsed;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-navigation': TestNavigation;
  }
}
