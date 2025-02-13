import { consume, provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { testContext } from '../../exports/test.context';
import { sessionContext } from '../../exports/session.context';
import { computedContext } from '../../exports/computed.context';

import type { QtiAssessmentItem } from '../../qti-components';
import type { ItemContext } from '../../exports/item.context';
import type { OutcomeVariable } from '../../exports/variables';
import type { ComputedContext, ComputedItem } from '../../exports/computed.context';
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
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @state()
  @consume({ context: sessionContext, subscribe: true })
  public _sessionContext?: SessionContext;

  @state()
  public configContext: ConfigContext = {};

  @state()
  @provide({ context: computedContext })
  public computedContext: ComputedContext;

  @property({ type: Boolean, attribute: 'auto-score-items' }) autoScoreItems = false;

  private _testElement: QtiAssessmentTest;

  constructor() {
    super();
    this.addEventListener('qti-assessment-test-connected', this._handleTestConnected.bind(this));
    this.addEventListener('qti-assessment-item-connected', this._handleItemConnected.bind(this));

    this.addEventListener('qti-interaction-changed', this._handleInteractionChanged.bind(this));

    this.addEventListener('test-end-attempt', this._handleTestEndAttempt.bind(this));
    this.addEventListener('test-show-correct-response', this._handleTestShowCorrectResponse.bind(this));

    this.addEventListener('qti-item-context-changed', this._handleItemContextChanged.bind(this));
  }

  private _handleTestEndAttempt(_event: CustomEvent) {
    const qtiItemEl = this._testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${this._sessionContext.navItemId}"]`
    );
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    const reportValidityAfterScoring = this.configContext?.reportValidityAfterScoring === true ? true : false;
    qtiAssessmentItemEl.processResponse(true, reportValidityAfterScoring);
  }

  private _updateComputedContext(updatedItemContext: ItemContext) {
    let itemIndex = 1;
    this.computedContext = {
      ...this.computedContext,
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
                const itemContext =
                  item.identifier === updatedItemContext.identifier
                    ? updatedItemContext
                    : this._testContext?.items.find(i => i.identifier === item.identifier);
                const computedItem: ItemContext & { [key: string]: any; identifier: string } = {
                  ...item,
                  ...itemContext
                };
                const rawscore = computedItem.variables?.find(vr => vr.identifier == 'SCORE')?.value;
                const score = parseInt(rawscore?.toString());
                const completionStatus = computedItem.variables?.find(v => v.identifier === 'completionStatus')?.value;
                const categories = computedItem.category ? computedItem.category?.split(' ') : [];

                const type = categories.includes(this.configContext?.infoItemCategory) ? 'info' : 'regular'; // rounded-full
                const active = this._sessionContext?.navItemId === computedItem.identifier || false; // !border-sky-600
                const correct =
                  // this._testContext.view === 'scorer' &&
                  (type == 'regular' && score !== undefined && !isNaN(score) && score > 0) || false; // bg-green-100 border-green-400
                const incorrect =
                  // this._testContext.view === 'scorer' &&
                  (type == 'regular' && score !== undefined && !isNaN(score) && score <= 0) || false; // bg-red-100 border-red-400
                const completed =
                  // this._testContext.view === 'candidate' &&
                  completionStatus === 'completed';
                // || item.category === this.host._configContext?.infoItemCategory || false

                const index = categories.includes(this.configContext?.infoItemCategory) ? null : itemIndex++;
                const base = this.initContext
                  ? this.initContext.find(i => i.identifier === computedItem.identifier)
                  : {};
                return {
                  ...base,
                  identifier: computedItem.identifier,
                  adaptive: computedItem.adaptive,
                  title: computedItem.title,
                  type,
                  active,
                  correct,
                  incorrect,
                  completed,
                  index,
                  variables: computedItem.variables
                } as ComputedItem;
              })
            };
          })
        };
      })
    };
  }

  private _handleItemContextChanged(event: CustomEvent<{ itemContext: ItemContext }>) {
    if (!event.detail.itemContext) return;
    this._updateComputedContext(event.detail.itemContext);
  }

  private _handleItemConnected(event: CustomEvent) {
    const assessmentItem = event.detail as QtiAssessmentItem;
    if (!assessmentItem.context) return;
    this._updateComputedContext(assessmentItem.context);
  }

  private _handleTestShowCorrectResponse(event: CustomEvent) {
    const qtiItemEl = this._testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${this._sessionContext.navItemId}"]`
    );
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    qtiAssessmentItemEl.showCorrectResponse(event.detail);
  }

  private _handleInteractionChanged(_event: CustomEvent) {
    if (this.autoScoreItems) {
      const assessmentItem = (_event.composedPath()[0] as HTMLElement).closest('qti-assessment-item');
      const scoreOutcomeIdentifier = assessmentItem.variables.find(v => v.identifier === 'SCORE') as OutcomeVariable;
      if (scoreOutcomeIdentifier.externalScored === null && assessmentItem.adaptive === 'false') {
        assessmentItem.processResponse();
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  /* PK: on test connected we can build the computed context */
  _handleTestConnected(event: CustomEvent) {
    this._testElement = event.detail as QtiAssessmentTest;
    const testPartElements = Array.from(this._testElement?.querySelectorAll<QtiTestPart>(`qti-test-part`) || []);
    this.computedContext = {
      testParts: testPartElements.map(testPart => {
        const sectionElements = [...testPart.querySelectorAll<QtiAssessmentSection>(`qti-assessment-section`)];
        return {
          active: false,
          identifier: testPart.identifier,
          sections: sectionElements.map(section => {
            const itemElements = [...section.querySelectorAll<QtiAssessmentItemRef>(`qti-assessment-item-ref`)];
            return {
              active: false,
              identifier: section.identifier,
              title: section.title,
              items: itemElements.map(item => {
                return {
                  active: false,
                  identifier: item.identifier,
                  href: item.href
                } as ComputedItem;
              })
            };
          })
        };
      })
    };
  }
}
