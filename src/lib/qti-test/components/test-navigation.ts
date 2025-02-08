import { consume, provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { testContext } from '../../exports/test.context';
import { sessionContext } from '../../exports/session.context';
import { computedContext } from '../../exports/computed.context';

import type { QtiAssessmentItem } from '../../qti-components';
import type { OutcomeVariable, ResponseVariable } from '../../exports/variables';
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
  }

  private _handleTestEndAttempt(_event: CustomEvent) {
    const qtiItemEl = this._testElement.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${this._sessionContext.navItemId}"]`
    );
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    const reportValidityAfterScoring = this.configContext?.reportValidityAfterScoring === true ? true : false;
    qtiAssessmentItemEl.processResponse(true, reportValidityAfterScoring);
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
                };
              })
            };
          })
        };
      })
    };

    // const sections = this.computedContext?.testParts.flatMap(testPart => testPart.sections);

    // let id;
    // if (this.navigate === 'section') {
    //   id = sections.find(section => section.active).identifier;
    // }
    // if (this.navigate === 'item') {
    //   id = sections.flatMap(section => section.items).find(item => item.active).identifier;
    // }

    // if (id) {
    //   this.dispatchEvent(
    //     new CustomEvent('qti-request-navigation', {
    //       detail: { type: this.navigate, id },
    //       bubbles: true,
    //       composed: true
    //     })
    //   );
    // }
  }

  /* PK: on item connected we can add item only properties in the xml */
  _handleItemConnected(event: CustomEvent) {
    const itemElement = event.detail as QtiAssessmentItem;
    this.computedContext = {
      ...this.computedContext,
      testParts: this.computedContext.testParts.map(testPart => {
        return {
          ...testPart,
          sections: testPart.sections.map(section => {
            return {
              ...section,
              items: section.items.map(item =>
                item.identifier === itemElement.identifier
                  ? {
                      ...item,
                      title: itemElement.title,
                      adaptive: itemElement.adaptive == 'true' || false,
                      timeDependent: itemElement.timeDependent == 'true' || false
                    }
                  : item
              )
            };
          })
        };
      })
    };
  }

  /* PK: on every change of the candidate we will recomputed the computedContext */
  protected willUpdate(_changedProperties: PropertyValues): void {
    if (!this.computedContext) return;

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
                const itemContext = this._testContext?.items.find(i => i.identifier === item.identifier);
                let computedItem;

                if (this.initContext) {
                  const initContext = this.initContext.find(i => i.identifier === item.identifier);
                  computedItem = { ...item, ...itemContext, ...initContext };
                } else {
                  computedItem = { ...item, ...itemContext };
                }

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
                const responseVariables: ResponseVariable[] = computedItem.variables?.filter(v => {
                  if (v.type !== 'response') {
                    return false;
                  }
                  if (v.identifier.toLowerCase().startsWith('response')) {
                    return true;
                  }
                  if ((v as ResponseVariable).correctResponse) {
                    return true;
                  }
                });
                // sort the response variables by the order of the string: identifier
                const sortedResponseVariables = responseVariables?.sort((a, b) =>
                  a.identifier.localeCompare(b.identifier)
                );
                const correctResponseArray = sortedResponseVariables.map(r => {
                  if (r.mapping && r.mapping.mapEntries.length > 0) {
                    return r.mapping.mapEntries
                      .map(m => {
                        return `${m.mapKey}=${m.mappedValue}pt `;
                      })
                      .join('&');
                  }
                  if (r.areaMapping && r.areaMapping.areaMapEntries.length > 0) {
                    return r.areaMapping.areaMapEntries.map(m => {
                      return `${m.coords} ${m.shape}=${m.mappedValue}`;
                    });
                  }
                  if (r.correctResponse) {
                    return Array.isArray(r.correctResponse) ? r.correctResponse.join('&') : r.correctResponse;
                  }
                  return [];
                });
                const correctResponse = correctResponseArray.join('&');
                const response =
                  sortedResponseVariables.length === 0
                    ? ''
                    : sortedResponseVariables
                        ?.map(v => {
                          if (Array.isArray(v.value)) {
                            return v.value.join('&');
                          }
                          return v.value;
                        })
                        .join('#');

                const index = categories.includes(this.configContext?.infoItemCategory) ? null : itemIndex++;
                return {
                  ...computedItem,
                  //   rawscore, // not necessary for outside world
                  //   score, // not necessary for outside world
                  //   completionStatus, // not necessary for outside world
                  //   categories, // not necessary for outside world
                  type,
                  active,
                  correct,
                  incorrect,
                  completed,
                  index,
                  correctResponse: correctResponse ? correctResponse : computedItem?.correctResponse || '',
                  value: response
                };
              })
            };
          })
        };
      })
    };
  }
}
