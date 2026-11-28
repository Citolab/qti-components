import { ContextConsumer, consume, provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import { computedContext } from '@qti-components/base';
import { buildTestModel } from '@qti-components/delivery';
import { configContext } from '@qti-components/base';
import { testContext } from '@qti-components/base';
import { sessionContext } from '@qti-components/base';
import { listenPublic as listenItemPublic } from '@qti-components/elements/public-events';

import { assessOptimality, deriveComputedContext, isItemDone } from '../../internal/derive-computed-context';
import { itemFactsContext } from '../../internal/item-facts.context';
import { renderedMarkup } from '../../internal/rendered-markup';
import { testHostContext } from '../../internal/test-host.context';
import { listenPublic } from '../../public-events';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiContext } from '@qti-components/base';
import type { OutcomeVariable } from '@qti-components/base';
import type { ComputedContext, ComputedItem } from '@qti-components/base';
import type { PropertyValues } from 'lit';
import type { QtiAssessmentItemRef } from '../qti-assessment-item-ref/qti-assessment-item-ref';
import type { QtiAssessmentTest } from '../qti-assessment-test/qti-assessment-test';
import type { TestModel } from '@qti-components/delivery';
import type { ItemOptimality } from '../../internal/derive-computed-context';
import type { ItemFactsByRef } from '../../internal/item-facts.context';
import type { ConfigContext } from '@qti-components/base';
import type { SessionContext } from '@qti-components/base';
import type { TestContext } from '@qti-components/base';
import type { ItemContext } from '@qti-components/base';

/** A new object each time: a host that mutates the one it read must not change anyone else's. */
const newQtiContext = (): QtiContext => ({
  QTI_CONTEXT: { testIdentifier: '', candidateIdentifier: '', environmentIdentifier: 'default' }
});

export class TestNavigation extends LitElement {
  @property({ type: String }) identifier: string | undefined = undefined;

  @state()
  public initContext: { identifier: string; [key: string]: any }[] = [];

  /**
   * @deprecated Set `qtiContext` on `qti-test`, which provides it. This is an alias for the
   * enclosing test's: reading returns it, writing replaces it, so a host that has always set the
   * shuffle seed here keeps working. Removed in the next major.
   *
   * Written before the navigation is inside a test, it waits and is handed over on connect.
   */
  public get qtiContext(): QtiContext {
    return this.#owner()?.qtiContext ?? (this.#pendingQtiContext ??= newQtiContext());
  }

  public set qtiContext(value: QtiContext) {
    if (!this.#warnedQtiContext) {
      this.#warnedQtiContext = true;
      console.warn(
        '[qti-components] `test-navigation.qtiContext` is deprecated and will be removed in the next major ' +
          'release. Set `qtiContext` on `<qti-test>` instead; it is the same value.'
      );
    }
    this.#writeQtiContext(value);
  }

  #pendingQtiContext?: QtiContext;
  #warnedQtiContext = false;

  /** The write the library itself makes. Not the deprecated setter, so it never warns about itself. */
  #writeQtiContext(value: QtiContext): void {
    const owner = this.#owner();
    if (owner) owner.qtiContext = value;
    else this.#pendingQtiContext = value;
  }

  /**
   * The `qti-test` this navigation is in, found through context so it works across shadow roots.
   * A write made before it is known waits in `#pendingQtiContext` and is handed over on arrival.
   */
  #testHost = new ContextConsumer(this, {
    context: testHostContext,
    subscribe: true,
    callback: host => {
      if (host && this.#pendingQtiContext) {
        host.qtiContext = this.#pendingQtiContext;
        this.#pendingQtiContext = undefined;
      }
    }
  });

  #owner(): { qtiContext: QtiContext } | null {
    return this.#testHost.value ?? null;
  }

  @state()
  @consume({ context: configContext, subscribe: true })
  public configContext: ConfigContext = {};

  @state()
  @consume({ context: testContext, subscribe: true })
  protected _testContext?: TestContext;

  @state()
  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  /** Read from each item's XML when `qti-test` fetches it; see `itemFactsContext`. */
  @state()
  @consume({ context: itemFactsContext, subscribe: true })
  protected _itemFacts?: ItemFactsByRef;

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
    listenPublic(this, 'qc-test-loaded', this.#handleTestConnected.bind(this));

    listenItemPublic(this, 'qc-item-response-changed', this.#handleInteractionChanged.bind(this));
    this.addEventListener('qti-item-context-updated', this.#handleItemContextUpdated.bind(this));

    listenPublic(this, 'qc-test-end-attempt', this.#handleTestEndAttempt.bind(this));
    listenPublic(this, 'qc-test-update-outcome', this.#handleTestUpdateOutcomeVariable.bind(this));
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
    const optimality = assessOptimality(itemContext);
    this.#optimality.set(itemContext.identifier, optimality);

    const computedItem = this.computedItemFor(itemContext.identifier);
    const numAttempts = Number(itemContext.variables?.find(v => v.identifier === 'numAttempts')?.value) || 0;
    const completionStatus = itemContext.variables?.find(v => v.identifier === 'completionStatus')?.value as string;
    this.afterAttemptEnded(
      (event.composedPath()[0] as HTMLElement)?.closest<QtiAssessmentItem>('qti-assessment-item'),
      computedItem,
      isItemDone(
        numAttempts,
        optimality,
        computedItem?.sessionControl?.maxAttempts,
        computedItem?.adaptive,
        completionStatus
      )
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
      `qti-assessment-item-ref[identifier="${CSS.escape(identifier)}"]`
    );
    return itemRef?.assessmentItem ?? undefined;
  }

  /** `computedContext.itemElement`: one function for the life of this element, carried along by every update. */
  #itemElement = (identifier: string): HTMLElement | null => this.#assessmentItemFor(identifier) ?? null;

  /** The currently active assessment item, exposed for optional presentation extensions. */
  protected get activeAssessmentItem(): QtiAssessmentItem | undefined {
    if (!this.#testElement || !this._sessionContext?.navItemRefId) return undefined;
    return this.#testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${this._sessionContext.navItemRefId}"]`
    )?.assessmentItem;
  }

  /**
   * Ends an attempt: the item named by `detail.itemId` (a `test-end-attempt` stamped into an item, or
   * given an `item`), or else the item on screen.
   */
  #handleTestEndAttempt(event: CustomEvent<{ itemId?: string } | undefined>) {
    const itemId = event.detail?.itemId;
    const qtiAssessmentItemEl = itemId ? this.#assessmentItemFor(itemId) : this.activeAssessmentItem;
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
      this.#writeQtiContext({
        QTI_CONTEXT: {
          ...currentContext,
          testIdentifier: this.#testElement.identifier,
          environmentIdentifier: currentContext.environmentIdentifier || 'default'
        }
      });
    }

    // Process qti-context-declaration elements to get default values
    const contextDeclarations = this.#testElement.querySelectorAll('qti-context-declaration[identifier="QTI_CONTEXT"]');

    contextDeclarations.forEach(declaration => {
      const defaultValues = this.#extractDefaultValues(declaration);
      if (Object.keys(defaultValues).length > 0) {
        // Merge default values with current context, but don't override existing runtime values
        this.#writeQtiContext({
          QTI_CONTEXT: {
            ...defaultValues, // Default values first
            ...this.qtiContext.QTI_CONTEXT // Runtime values override defaults
          }
        });
      }
    });

    // The structure and the session-control cascade come from the test's markup, not from upgraded
    // properties, so they do not depend on registration or render timing.
    this.#model = buildTestModel(renderedMarkup(this.#testElement));
    this.computedContext = this.#derive();
  }

  /** The test's structure and resolved session control, read from its markup when it is connected. */
  #model?: TestModel;

  /** `computedContext`, derived anew from its inputs (`deriveComputedContext`), never from the previous one. */
  #derive(): ComputedContext {
    this.#seedOptimality();
    return deriveComputedContext({
      model: this.#model,
      itemFacts: this._itemFacts,
      testContext: this._testContext,
      sessionContext: this._sessionContext,
      infoItemCategory: this.configContext?.infoItemCategory,
      itemData: this.initContext,
      optimality: this.#optimality,
      itemElement: this.#itemElement
    });
  }

  /**
   * On a restored session no attempt is ended this run, so the latch is seeded once from the
   * persisted context, which still holds the submitted response. A later change of the answer
   * leaves the seeded value alone.
   */
  #seedOptimality(): void {
    for (const itemContext of this._testContext?.items ?? []) {
      if (!itemContext.identifier || this.#optimality.has(itemContext.identifier)) continue;
      const numAttempts = Number(itemContext.variables?.find(v => v.identifier === 'numAttempts')?.value) || 0;
      if (numAttempts > 0) this.#optimality.set(itemContext.identifier, assessOptimality(itemContext));
    }
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

  /* On every change of the candidate's state, the context is derived again. */
  protected override willUpdate(_changedProperties: PropertyValues): void {
    if (!this.#model) return;
    this.computedContext = this.#derive();
    this.dispatchEvent(
      new CustomEvent('qti-computed-context-updated', {
        detail: this.computedContext,
        bubbles: true
      })
    );
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    this.#lockUsedItems();
  }

  /** The items this navigation disabled because their attempts are used, so it releases only those. */
  #lockedItems = new WeakSet<QtiAssessmentItem>();

  /**
   * Disables every rendered item whose attempts are used, from the computed context, so the
   * candidate cannot change the answer once the last attempt is ended. Runs after every update:
   * an item rendered later (another item, a section on screen, a restored state) is locked as it
   * arrives, and one whose attempts are back to zero (a new state) is released.
   *
   * Only `disabled = true` is ever set here, and only on an item that was not disabled already; a
   * host or view that disables or makes an item read-only itself keeps it so.
   */
  #lockUsedItems(): void {
    if (!this.#testElement || !this.computedContext) return;
    // In a simultaneous part every item has one attempt, processed when the part ends (QTI info model
    // §2.8.2), so the candidate may change the answer until then: TAO keeps such an item open too.
    const items = new Map(
      this.computedContext.testParts.flatMap(part =>
        part.submissionMode === 'simultaneous'
          ? []
          : part.sections.flatMap(section => section.items.map(item => [item.identifier, item] as const))
      )
    );
    for (const itemRef of this.#testElement.querySelectorAll<QtiAssessmentItemRef>('qti-assessment-item-ref')) {
      const element = itemRef.assessmentItem;
      if (!element) continue;
      const used = this.#attemptsUsed(items.get(itemRef.identifier), element);
      if (used && !element.disabled) {
        element.disabled = true;
        this.#lockedItems.add(element);
      } else if (!used && this.#lockedItems.has(element)) {
        this.#lockedItems.delete(element);
        element.disabled = false;
      }
    }
  }

  /**
   * The same rule as `test-end-attempt`'s max-attempts guard: a non-adaptive item with a
   * `max-attempts` above 0 whose attempts reached it. Adaptive items end themselves, and 0 is
   * unlimited. With `auto-score-items` every change is scored as an attempt, so the count is not
   * the candidate's and locks nothing.
   */
  #attemptsUsed(item: ComputedItem | undefined, element: QtiAssessmentItem): boolean {
    if (!item || this.autoScoreItems) return false;
    if (item.adaptive || element.adaptive === 'true') return false;
    const maxAttempts = item.sessionControl?.maxAttempts ?? 1;
    return maxAttempts > 0 && (item.numAttempts ?? 0) >= maxAttempts;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-navigation': TestNavigation;
  }
}
