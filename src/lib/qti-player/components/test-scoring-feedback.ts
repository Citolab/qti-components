import { OutcomeVariable } from '@citolab/qti-components/qti-components';
import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from 'src/lib/qti-test';

@customElement('test-scoring-feedback')
export class TestScoringFeedback extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  render() {
    const { items } = this._testContext;
    const item = items.find(item => item.identifier === this._sessionContext.identifier);

    if (item?.category === 'dep-informational') return;

    const completionStatus = item?.variables.find(v => v.identifier === 'completionStatus')?.value;
    const scoreOutcome = item?.variables.find(vr => vr.identifier == 'SCORE') as OutcomeVariable;
    const score = parseInt(scoreOutcome?.value as string);
    const externalScored = scoreOutcome?.externalScored;

    const feedbackText = () => {
      if (completionStatus !== 'completed') {
        return this.dataset.textNoResponse;
      }

      if (!externalScored) {
        return score && score > 0 ? this.dataset.textCorrect : this.dataset.textIncorrect;
      }

      if (externalScored === 'externalMachine') {
        return html` <div class="flex gap-2 animate-spin">Je antwoord wordt nagekeken</div>`;
      }

      if (externalScored === 'human') {
        return Number.isNaN(score) ? 'woot' : 'waahh';
      }

      return Number.isNaN(score) || score === undefined
        ? 'We konden je antwoord geen score geven, omdat we te weinig antwoorden konden vinden die op jouw antwoord leken. Kijk je antwoord zelf na.'
        : `We hebben je antwoord ${score === 0 ? 'geen punten' : score == 1 ? 'één punt' : `${score} punten`} gegeven. Je kunt je score zelf aanpassen als je denkt dat dat niet klopt.`;
    };

    return externalScored !== 'human' || Number.isNaN(score) ? html` ${feedbackText()}` : nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-scoring-feedback': TestScoringFeedback;
  }
}
