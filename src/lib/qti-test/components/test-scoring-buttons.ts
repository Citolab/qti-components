import { html, LitElement, nothing } from 'lit';

import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { QtiTest, sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-scoring-buttons')
export class TestScoringButtons extends LitElement {
  @property({ type: String, attribute: 'view' }) view = ''; // is only an attribute, but this is here because.. react
  @property({ type: Boolean }) disabled: boolean = false;

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  // protected createRenderRoot(): HTMLElement | DocumentFragment {
  //   const renderTo = this.getAttribute('render-to');
  //   return renderTo ? this.closest('qti-ext-test').querySelector<HTMLDivElement>(renderTo) : this;
  // }
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
    // const renderTo = this.getAttribute('render-to');
    // return renderTo ? this.closest('qti-ext-test').querySelector<HTMLDivElement>(renderTo) : this;
  }

  _changeOutcomeScore(value: number) {
    const { items } = this._testContext;
    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);
    const currentItemIdentifier = this._testContext.items[itemIndex].identifier;
    const qtiAssessmentTestEl = this.closest('qti-test') as QtiTest;
    const qtiItemEl = qtiAssessmentTestEl.itemRefEls.get(currentItemIdentifier);
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    qtiAssessmentItemEl.updateOutcomeVariable('SCORE', value.toString());
  }

  render() {
    const { items } = this._testContext;
    const item = items.find(item => item.identifier === this._sessionContext.identifier);
    if (items.length === 0) return nothing;
    const maxScore = item.variables.find(vr => vr.identifier == 'MAXSCORE')?.value;
    const score = item.variables.find(vr => vr.identifier == 'SCORE')?.value;

    return maxScore
      ? html`
          <form part="form">
            ${[...Array(Number(maxScore) + 1).keys()].map(itemIndex => {
              const identifier = `scoring-buttons${itemIndex}${item.identifier}`;
              return html` <input
                  part="input"
                  type="radio"
                  ?disabled=${this.disabled}
                  .checked=${itemIndex === Number(score)}
                  @change=${() => this._changeOutcomeScore(itemIndex)}
                  id=${identifier}
                  name=${`scoring-buttons-${item.identifier}`}
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
