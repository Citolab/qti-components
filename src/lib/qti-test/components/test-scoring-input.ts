import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { testContext, TestContext } from '../qti-assessment-test.context';
import { QtiAssessmentTest } from '../qti-assessment-test';

@customElement('test-scoring-input')
export class TestScoringInput extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testContext?: TestContext;

  @property({ type: Boolean }) disabled = false;

  _changeOutcomeScore(value: number) {
    const currentItemIdentifier = this._testContext.items[this._testContext.itemIndex].identifier;
    const qtiAssessmentTestEl = this.closest('qti-assessment-test') as QtiAssessmentTest;
    const qtiItemEl = qtiAssessmentTestEl.itemRefEls.get(currentItemIdentifier);
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    qtiAssessmentItemEl.updateOutcomeVariable('SCORE', value.toString());
  }

  override render() {
    const { items, itemIndex } = this._testContext;
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
