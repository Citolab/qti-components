import { css, html, nothing } from 'lit';

import { QtiSliderInteraction } from '@qti-components/slider-interaction/elements';

import { CandidateCorrectionMixin } from '../mixins/candidate-correction.mixin';

export class QtiSliderInteractionCorrection extends CandidateCorrectionMixin(QtiSliderInteraction) {
  #correctResponseNumber: number | null = null;

  static override styles = [
    QtiSliderInteraction.styles,
    css`
      [part='knob-correct'] {
        background-color: var(--qti-correct-light);
        border: 2px solid var(--qti-correct);
        position: relative;
        height: 1rem;
        width: 1rem;
        transform-origin: center;
        transform: translateX(-50%);
        cursor: pointer;
        border-radius: 9999px;
        left: var(--value-percentage-correct);
      }
    `
  ];

  public override toggleInternalCorrectResponse(show: boolean): void {
    super.toggleInternalCorrectResponse(show);
    const response = this.correctResponse;
    const raw = Array.isArray(response) ? response[0] : response;
    const value = show && raw ? parseFloat(raw) : NaN;
    const previous = this.#correctResponseNumber;
    this.#correctResponseNumber = Number.isFinite(value) ? value : null;
    if (this.#correctResponseNumber !== null) {
      const percentage = ((this.#correctResponseNumber - this.min) / (this.max - this.min)) * 100;
      this.style.setProperty('--value-percentage-correct', `${percentage}%`);
    } else {
      this.style.removeProperty('--value-percentage-correct');
    }
    this.requestUpdate('correctResponseNumber', previous);
  }

  protected override renderRailSupplement(): unknown {
    return this.#correctResponseNumber === null
      ? nothing
      : html`<div id="knob-correct" part="knob-correct">
          <div id="value" part="value">${this.#correctResponseNumber}</div>
        </div>`;
  }
}
