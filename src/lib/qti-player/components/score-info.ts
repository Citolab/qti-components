import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class ScoreInfo extends LitElement {
  @property({ type: Boolean }) answered?: boolean;
  @property({ type: Number }) score?: number;
  @property({ type: String }) scoreType!: string;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  render() {
    const feedbackText = () => {
      if (!this.answered) {
        return 'je hebt geen antwoord ingevuld';
      }

      if (this.scoreType === 'busy') {
        return html` <div class="flex gap-2">
          Je antwoord wordt nagekeken.
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4" cy="12" r="3">
              <animate
                id="spinner_qFRN"
                begin="0;spinner_OcgL.end+0.25s"
                attributeName="cy"
                calcMode="spline"
                dur="0.6s"
                values="12;6;12"
                keySplines=".33,.66,.66,1;.33,0,.66,.33"
              />
            </circle>
            <circle cx="12" cy="12" r="3">
              <animate
                begin="spinner_qFRN.begin+0.1s"
                attributeName="cy"
                calcMode="spline"
                dur="0.6s"
                values="12;6;12"
                keySplines=".33,.66,.66,1;.33,0,.66,.33"
              />
            </circle>
            <circle cx="20" cy="12" r="3">
              <animate
                id="spinner_OcgL"
                begin="spinner_qFRN.begin+0.2s"
                attributeName="cy"
                calcMode="spline"
                dur="0.6s"
                values="12;6;12"
                keySplines=".33,.66,.66,1;.33,0,.66,.33"
              />
            </circle>
          </svg>
        </div>`;
      }

      if (this.scoreType === 'manual') {
        return Number.isNaN(this.score) ? '' : '';
      }

      if (this.scoreType === 'response-processing') {
        return this.score && this.score > 0 ? 'je antwoord is goed' : 'je antwoord is fout';
      }

      return Number.isNaN(this.score) || this.score === undefined
        ? 'We konden je antwoord geen score geven, omdat we te weinig antwoorden konden vinden die op jouw antwoord leken. Kijk je antwoord zelf na.'
        : `We hebben je antwoord ${this.score === 0 ? 'geen punten' : this.score == 1 ? 'één punt' : `${this.score} punten`} gegeven. Je kunt je score zelf aanpassen als je denkt dat dat niet klopt.`;
    };

    return this.scoreType !== 'manual' || Number.isNaN(this.score)
      ? html` <div
          class="feedback relative ml-3 flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-0.5 text-sm font-semibold text-gray-600"
        >
          ${feedbackText()}
        </div>`
      : html`<div></div>`;
  }
}

customElements.define('score-info', ScoreInfo);

declare global {
  interface HTMLElementTagNameMap {
    'score-info': ScoreInfo;
  }
}
