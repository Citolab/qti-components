import { consume } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestContext, testContext } from '../qti-assessment-test.context';
import { QtiAssessmentTest } from '../qti-assessment-test';

@customElement('test-scoring-buttons')
export class TestScoringButtons extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testContext?: TestContext;

  _changeOutcomeScore(value: number) {
    const currentItemIdentifier = this._testContext.items[this._testContext.itemIndex].identifier;
    const qtiAssessmentTestEl = this.closest('qti-assessment-test') as QtiAssessmentTest;
    const qtiItemEl = qtiAssessmentTestEl.itemRefEls.get(currentItemIdentifier);
    const qtiAssessmentItemEl = qtiItemEl.assessmentItem;
    qtiAssessmentItemEl.updateOutcomeVariable('SCORE', value.toString());
  }

  render() {
    const { items, itemIndex } = this._testContext;
    const maxScore = items[itemIndex].variables.find(vr => vr.identifier == 'MAXSCORE')?.value;
    const score = items[itemIndex].variables.find(vr => vr.identifier == 'SCORE')?.value;

    return maxScore && score
      ? html`
          ${[...Array(Number(maxScore) + 1).keys()].map(
            (item, index) =>
              html` <label>
                <input
                  type="radio"
                  part="input"
                  name="test-scoring-buttons"
                  value="${index}"
                  ?checked=${index === Number(score)}
                  @change=${_ => this._changeOutcomeScore(index)}
                  id="test-scoring-buttons"
                />
                ${index}
              </label>`
          )}
        `
      : nothing;
  }
}
