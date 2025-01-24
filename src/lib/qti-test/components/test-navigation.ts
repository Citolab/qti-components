import { consume, provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { testContext } from '../../exports/test.context';
import { sessionContext } from '../../exports/session.context';
import { configContext } from '../../exports/config.context';
import { computedContext } from '../../exports/computed.context';

import type { OutcomeVariable } from '../../exports/variables';
import type { ComputedContext } from '../../exports/computed.context';
import type { PropertyValues } from 'lit';
import type { QtiAssessmentItemRef, QtiAssessmentSection, QtiAssessmentTest, QtiTestPart } from '../core';
import type { ConfigContext } from '../../exports/config.context';
import type { SessionContext } from '../../exports/session.context';
import type { TestContext } from '../../exports/test.context';

@customElement('test-navigation')
export class TestNavigation extends LitElement {
  @state()
  public initContext: { identifier: string; [key: string]: any }[] = [];

  @state()
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @state()
  @consume({ context: sessionContext, subscribe: true })
  public _sessionContext?: SessionContext;

  @state()
  @provide({ context: configContext })
  public configContext: ConfigContext = {};

  @state()
  @provide({ context: computedContext })
  public computedContext: ComputedContext;

  @property({ type: Boolean, attribute: 'auto-score-items' }) autoScoreItems = false;

  testElement: QtiAssessmentTest;

  constructor() {
    super();
    this.addEventListener('qti-assessment-test-connected', this._handleTestConnected.bind(this));
    this.addEventListener('qti-interaction-changed', this._handleInteractionChanged.bind(this));
  }

  _handleInteractionChanged(_event: CustomEvent) {
    if (this.autoScoreItems) {
      const qtiItemEl = this.testElement.querySelector<QtiAssessmentItemRef>(
        `qti-assessment-item-ref[identifier="${this._sessionContext.navItemId}"]`
      );
      const qtiAssessmentItem = qtiItemEl.assessmentItem;
      const scoreOutcomeIdentifier = qtiAssessmentItem.variables.find(v => v.identifier === 'SCORE') as OutcomeVariable;
      if (scoreOutcomeIdentifier.externalScored === null && qtiAssessmentItem.adaptive === 'false') {
        qtiAssessmentItem.processResponse();
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  _handleTestConnected(event: CustomEvent) {
    this.testElement = event.detail as QtiAssessmentTest;
    const testPartElements = Array.from(this.testElement?.querySelectorAll<QtiTestPart>(`qti-test-part`) || []);
    this.computedContext = {
      testElement: this.testElement,
      testParts: testPartElements.map((testPart, indexTestPart) => {
        const sectionElements = [...testPart.querySelectorAll<QtiAssessmentSection>(`qti-assessment-section`)];
        return {
          active: indexTestPart == 0,
          identifier: testPart.identifier,
          sections: sectionElements.map((section, indexSection) => {
            const itemElements = [...section.querySelectorAll<QtiAssessmentItemRef>(`qti-assessment-item-ref`)];
            return {
              active: indexSection == 0,
              identifier: section.identifier,
              title: section.title,
              items: itemElements.map((item, indexItem) => {
                return {
                  active: indexItem == 0,
                  identifier: item.identifier,
                  href: item.href
                };
              })
            };
          })
        };
      })
    };
  }

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

              items: section.items.map(itemRef => {
                const itemContext = this._testContext?.items.find(i => i.identifier === itemRef.identifier);
                let item;

                if (this.initContext) {
                  const initContext = this.initContext.find(i => i.identifier === itemRef.identifier);
                  item = { ...itemContext, ...initContext };
                } else {
                  item = itemContext;
                }

                const rawscore = item.variables?.find(vr => vr.identifier == 'SCORE')?.value;
                const score = parseInt(rawscore?.toString());
                const completionStatus = item.variables?.find(v => v.identifier === 'completionStatus')?.value;
                const categories = item.category ? item.category?.split(' ') : [];

                const type = categories.includes(this.configContext?.infoItemCategory) ? 'info' : 'regular'; // rounded-full
                const active = this._sessionContext?.navItemId === item.identifier || false; // !border-sky-600

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
                const response = item.variables?.find(v => v.identifier === 'RESPONSE')?.value || '';

                const index = categories.includes(this.configContext?.infoItemCategory) ? null : itemIndex++;

                return {
                  ...item,
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
                  response
                };
              })
            };
          })
        };
      })
    };
  }
}
