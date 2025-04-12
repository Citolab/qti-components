import { consume, provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { testContext } from '../../exports/test.context';
import { sessionContext } from '../../exports/session.context';
import { computedContext } from '../../exports/computed.context';

import type { QtiAssessmentItem } from '../../qti-components';
import type { OutcomeVariable } from '../../exports/variables';
import type { ComputedContext } from '../../exports/computed.context';
import type { PropertyValues } from 'lit';
import type { QtiAssessmentItemRef, QtiAssessmentSection, QtiAssessmentTest, QtiTestPart } from '../core';
import type { ConfigContext } from '../../exports/config.context';
import type { SessionContext } from '../../exports/session.context';
import type { TestContext } from '../../exports/test.context';

type CustomEventMap = {
  'test-end-attempt': CustomEvent;
  'test-show-correct-response': CustomEvent<{ value: boolean }>;
};

declare global {
  interface GlobalEventHandlersEventMap extends CustomEventMap {}
}

@customElement('test-navigation')
export class TestNavigation extends LitElement {
  @property({ type: String }) identifier = undefined;

  @state()
  public initContext: { identifier: string; [key: string]: any }[] = [];

  @state()
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

  private _testElement: QtiAssessmentTest;

  constructor() {
    super();
    this.addEventListener('qti-assessment-test-connected', this._handleTestConnected.bind(this));
    this.addEventListener('qti-assessment-item-connected', this._handleItemConnected.bind(this));

    this.addEventListener('qti-interaction-changed', this._handleInteractionChanged.bind(this));

    this.addEventListener('test-end-attempt', this._handleTestEndAttempt.bind(this));
    this.addEventListener('test-show-correct-response', this._handleTestShowCorrectResponse.bind(this));
    this.addEventListener('test-update-outcome-variable', this._handleTestUpdateOutcomeVariable.bind(this));
  }

  /**
   * Handles the 'test-end-attempt' event.
   * @private
   * @listens TestNavigation#test-end-attempt
   * @param {CustomEvent} event - The custom event object.
   */
  private _handleTestEndAttempt(_event: CustomEvent) {
    const qtiItemEl = this._testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${this._sessionContext.navItemRefId}"]`
    );
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    const reportValidityAfterScoring = this.configContext?.reportValidityAfterScoring === true ? true : false;
    qtiAssessmentItemEl.processResponse(true, reportValidityAfterScoring);
  }

  /**
   * Handles the 'test-end-attempt' event.
   * @private
   * @listens TestNavigation#test-show-correct-response
   * @param {CustomEvent} event - The custom event object.
   */
  private _handleTestShowCorrectResponse(event: CustomEvent) {
    const qtiItemEl = this._testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${this._sessionContext.navItemRefId}"]`
    );
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    qtiAssessmentItemEl.showCorrectResponse(event.detail);
  }

  private _handleTestUpdateOutcomeVariable(event: CustomEvent) {
    const qtiItemEl = this._testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${event.detail.assessmentItemRefId}"]`
    );
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    qtiAssessmentItemEl.setOutcomeVariable(event.detail.outcomeVariableId, event.detail.value);
  }

  private _handleInteractionChanged(_event: CustomEvent) {
    if (this.autoScoreItems) {
      const assessmentItem = (_event.composedPath()[0] as HTMLElement).closest('qti-assessment-item');
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

  render() {
    return html`<slot></slot>`;
  }

  /* PK: on test connected we can build the computed context */
  private _handleTestConnected(event: CustomEvent) {
    this._testElement = event.detail as QtiAssessmentTest;
    const testPartElements = Array.from(this._testElement?.querySelectorAll<QtiTestPart>(`qti-test-part`) || []);
    this.computedContext = {
      identifier: this._testElement.identifier,
      title: this._testElement.title,
      view: this._sessionContext?.view,
      testParts: testPartElements.map(testPart => {
        const sectionElements = [...testPart.querySelectorAll<QtiAssessmentSection>(`qti-assessment-section`)];
        return {
          active: false,
          identifier: testPart.identifier,
          navigationMode: testPart.navigationMode,
          submissionMode: testPart.submissionMode,
          sections: sectionElements.map(section => {
            const itemElements = [...section.querySelectorAll<QtiAssessmentItemRef>(`qti-assessment-item-ref`)];
            return {
              active: false,
              identifier: section.identifier,
              title: section.title,
              items: itemElements.map(item => ({
                ...this.initContext?.find(i => i.identifier === item.identifier),
                active: false,
                identifier: item.identifier,
                categories: item.category ? item.category?.split(' ') : [],
                href: item.href,
                variables: []
              }))
            };
          })
        };
      })
    };
  }

  /* PK: on item connected we can add item only properties in the xml */
  private _handleItemConnected(event: CustomEvent) {
    const itemElement = event.detail as QtiAssessmentItem;

    let itemIndex = 1;
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
                const rawMaxScore = item.variables?.find(vr => vr.identifier == 'MAXSCORE')?.value;
                const maxScore = parseInt(rawMaxScore?.toString());

                const scoreOutcome = item.variables.find(vr => vr.identifier == 'SCORE') as OutcomeVariable;
                const externalScored = scoreOutcome?.externalScored;

                const containsCorrectResponse = !!item?.variables?.some(v => v['correctResponse']);
                const containsMapping = !!item?.variables?.some(v => {
                  return v['mapping']?.mapEntries?.length > 0 || v['areaMapping']?.areaMapEntries?.length > 0;
                });
                const hasCorrectResponse = !containsCorrectResponse && !containsMapping;

                const index = item.categories.includes(this.configContext?.infoItemCategory) ? null : itemIndex++;

                return {
                  ...item,
                  assessmentItemIdentifier: itemElement.getAttribute('identifier'),
                  label: itemElement.getAttribute('label'),
                  title: itemElement.title,
                  maxScore,
                  externalScored,
                  adaptive: itemElement.adaptive == 'true' || false,
                  timeDependent: itemElement.timeDependent == 'true' || false,
                  variables: itemElement.variables,
                  hasCorrectResponse,
                  index
                };
              })
            };
          })
        };
      })
    };
  }

  /* PK: on every change of the candidate we will recomputed the computedContext */
  protected willUpdate(_changedProperties: PropertyValues): void {
    if (!this.computedContext) return;

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
                const computedItem = { ...item, ...itemContext };

                const rawscore = computedItem.variables?.find(vr => vr.identifier == 'SCORE')?.value;
                const score = parseInt(rawscore?.toString());

                const completionStatus = computedItem.variables?.find(v => v.identifier === 'completionStatus')
                  ?.value as string;

                const response = computedItem.variables?.find(v => v.identifier === 'RESPONSE')?.value || '';
                const numAttempts = computedItem.variables?.find(v => v.identifier === 'NUMATTEMPTS')?.value || 0;

                const type = item.categories.includes(this.configContext?.infoItemCategory) ? 'info' : 'regular';
                const active = this._sessionContext?.navItemRefId === computedItem.identifier || false;
                const correct = (type == 'regular' && score !== undefined && !isNaN(score) && score > 0) || false;
                const incorrect = (type == 'regular' && score !== undefined && !isNaN(score) && score <= 0) || false;
                const completed = completionStatus === 'completed';

                return {
                  ...computedItem,
                  completionStatus,
                  numAttempts,
                  score,
                  response,

                  type,
                  active,
                  correct,
                  incorrect,
                  completed
                };
              })
            };
          })
        };
      })
    };

    this.dispatchEvent(
      new CustomEvent('test-computed-context-changed', {
        detail: this.computedContext,
        bubbles: true
      })
    );
  }
}
