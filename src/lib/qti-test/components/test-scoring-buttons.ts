import { html, LitElement, nothing } from 'lit';
import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';

import { testContext } from '../../exports/test.context';
import { computedContext } from '../../exports/computed.context';
import { sessionContext } from '../../exports/session.context';

import type { QtiAssessmentItemRef } from '../core';
import type { OutcomeVariable } from '../../exports/variables';
import type { ComputedContext } from '../../exports/computed.context';
import type { TestContext } from '../../exports/test.context';
import type { SessionContext } from '../../exports/session.context';

@customElement('test-scoring-buttons')
export class TestScoringButtons extends LitElement {
  @property({ type: String, attribute: 'view' }) view = ''; // is only an attribute, but this is here because.. react
  @property({ type: Boolean }) disabled: boolean = false;

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  public _sessionContext?: SessionContext;

  @consume({ context: computedContext, subscribe: true })
  public computedContext?: ComputedContext;

  _changeOutcomeScore(value: number) {
    const testPart = this.computedContext?.testParts.find(testPart => testPart.active);
    const sectionItems = testPart.sections.flatMap(section => section.items);
    const currentItemIdentifier = sectionItems.find(item => item.active)?.identifier;

    const qtiPlayerElement = this.closest('qti-test');
    const testContainer = qtiPlayerElement.querySelector('test-container').shadowRoot;

    const qtiItemEl = testContainer.querySelector<QtiAssessmentItemRef>(
      `qti-assessment-item-ref[identifier="${currentItemIdentifier}"]`
    );

    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    qtiAssessmentItemEl.updateOutcomeVariable('SCORE', value.toString());
  }

  render() {
    const activeItem = this.computedContext?.testParts
      .flatMap(testPart => testPart.sections.flatMap(section => section.items))
      .find(item => item.active);

    if (!activeItem || !activeItem.variables) return html``;

    const maxScore = activeItem.variables.find(vr => vr.identifier == 'MAXSCORE')?.value;
    const scoreOutcome = activeItem.variables.find(vr => vr.identifier == 'SCORE') as OutcomeVariable;

    const score = scoreOutcome?.value;

    // this.disabled = !(scoreOutcome?.externalScored === 'human');

    this.disabled = !(activeItem as any).externalScored;

    return maxScore
      ? html`
          <form part="form">
            ${[...Array(Number(maxScore) + 1).keys()].map(itemIndex => {
              const identifier = `scoring-buttons${itemIndex}${activeItem.identifier}`;
              return html` <input
                  part="input"
                  type="radio"
                  ?disabled=${this.disabled}
                  .checked=${itemIndex === Number(score)}
                  @change=${() => this._changeOutcomeScore(itemIndex)}
                  id=${identifier}
                  name=${`scoring-buttons-${activeItem.identifier}`}
                  value=${itemIndex}
                />

                <label part="label" for=${identifier}>${itemIndex}</label>`;
            })}
          </form>
          <slot></slot>
        `
      : nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-scoring-buttons': TestScoringButtons;
  }
}
