import { svg } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import { QtiGraphicAssociateInteraction } from '@qti-components/graphic-associate-interaction/elements';

import { CandidateCorrectionMixin } from '../mixins/candidate-correction.mixin';

export class QtiGraphicAssociateInteractionCorrection extends CandidateCorrectionMixin(QtiGraphicAssociateInteraction) {
  #correctLines: string[] = [];

  public override toggleInternalCorrectResponse(show: boolean): void {
    super.toggleInternalCorrectResponse(show);
    const response = this.correctResponse;
    const previous = this.#correctLines;
    this.#correctLines = show && response ? (Array.isArray(response) ? [...response] : [response]) : [];
    this.requestUpdate('correctLines', previous);
  }

  protected override renderSupplementalLines(): unknown {
    return repeat(
      this.#correctLines,
      line => line,
      line => svg`
        <line
          part="correct-line"
          x1=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[0]}]`)!.style.left)}
          y1=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[0]}]`)!.style.top)}
          x2=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[1]}]`)!.style.left)}
          y2=${parseInt(this.querySelector<SVGLineElement>(`[identifier=${line.split(' ')[1]}]`)!.style.top)}
          stroke="var(--qti-correct)"
          stroke-width="3"
          stroke-dasharray="5,5"
        />
      `
    );
  }
}
