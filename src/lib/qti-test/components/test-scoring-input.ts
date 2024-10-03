import { html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { QtiTest, sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-scoring-input')
export class TestScoringInput extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @property({ type: Boolean }) disabled = false;

  _changeOutcomeScore(value: number) {
    const { items } = this._testContext;

    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);

    const currentItemIdentifier = this._testContext.items[itemIndex].identifier;
    const qtiAssessmentTestEl = this.closest('qti-test') as QtiTest;
    const qtiItemEl = qtiAssessmentTestEl.itemRefEls.get(currentItemIdentifier);
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    qtiAssessmentItemEl.updateOutcomeVariable('SCORE', value.toString());
  }

  override render() {
    const { items } = this._testContext;
    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);

    const maxScore = Number(items[itemIndex].variables.find(vr => vr.identifier == 'MAXSCORE').value);
    const score = Number(items[itemIndex].variables.find(vr => vr.identifier == 'SCORE').value);

    return html`
      <input
        part="input"
        type="number"
        spellcheck="false"
        autocomplete="off"
        @keyup=${e => this._changeOutcomeScore(e.target.value)}
        @change=${e => this._changeOutcomeScore(e.target.value)}
        placeholder="score"
        min=${0}
        max=${maxScore}
        .value=${score.toString()}
        size="10"
        ?disabled=${this.disabled}
        id="test-scoring-input"
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-scoring-input': TestScoringInput;
  }
}
