import { OutcomeVariable } from '@citolab/qti-components/qti-components';
import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from 'src/lib/qti-test';

@customElement('score-info')
export class ScoreInfo extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  render() {
    const { items } = this._testContext;
    const item = items.find(item => item.identifier === this._sessionContext.identifier);

    if (item.category === 'dep-informational') return;

    const completionStatus = item.variables.find(v => v.identifier === 'completionStatus')?.value;
    const scoreOutcome = item.variables.find(vr => vr.identifier == 'SCORE') as OutcomeVariable;
    const score = parseInt(scoreOutcome?.value as string);
    const externalScored = scoreOutcome?.externalScored;

    const feedbackText = () => {
      if (completionStatus !== 'completed') {
        return 'je hebt geen antwoord ingevuld';
      }

      // if (this.scoreType === 'busy') {
      //   return html` <div class="flex gap-2">
      //     Je antwoord wordt nagekeken.
      //     <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      //       <circle cx="4" cy="12" r="3">
      //         <animate
      //           id="spinner_qFRN"
      //           begin="0;spinner_OcgL.end+0.25s"
      //           attributeName="cy"
      //           calcMode="spline"
      //           dur="0.6s"
      //           values="12;6;12"
      //           keySplines=".33,.66,.66,1;.33,0,.66,.33"
      //         />
      //       </circle>
      //       <circle cx="12" cy="12" r="3">
      //         <animate
      //           begin="spinner_qFRN.begin+0.1s"
      //           attributeName="cy"
      //           calcMode="spline"
      //           dur="0.6s"
      //           values="12;6;12"
      //           keySplines=".33,.66,.66,1;.33,0,.66,.33"
      //         />
      //       </circle>
      //       <circle cx="20" cy="12" r="3">
      //         <animate
      //           id="spinner_OcgL"
      //           begin="spinner_qFRN.begin+0.2s"
      //           attributeName="cy"
      //           calcMode="spline"
      //           dur="0.6s"
      //           values="12;6;12"
      //           keySplines=".33,.66,.66,1;.33,0,.66,.33"
      //         />
      //       </circle>
      //     </svg>
      //   </div>`;
      // }

      if (!externalScored) {
        return score && score > 0 ? 'je antwoord is goed' : 'je antwoord is fout';
      }

      if (externalScored === 'human') {
        return Number.isNaN(score) ? '' : '';
      }

      return Number.isNaN(score) || score === undefined
        ? 'We konden je antwoord geen score geven, omdat we te weinig antwoorden konden vinden die op jouw antwoord leken. Kijk je antwoord zelf na.'
        : `We hebben je antwoord ${score === 0 ? 'geen punten' : score == 1 ? 'één punt' : `${score} punten`} gegeven. Je kunt je score zelf aanpassen als je denkt dat dat niet klopt.`;
    };

    return externalScored !== 'human' || Number.isNaN(score)
      ? html` <div
          class="feedback relative ml-3 flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-0.5 text-sm font-semibold text-gray-600"
        >
          ${feedbackText()}
        </div>`
      : nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'score-info': ScoreInfo;
  }
}
