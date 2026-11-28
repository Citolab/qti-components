import { hasState } from '@qti-components/base';
import { QtiGraphicOrderInteraction } from '@qti-components/graphic-order-interaction/elements';

import { CandidateCorrectionMixin } from '../mixins/candidate-correction.mixin';

import type { Choice } from '@qti-components/interactions-core/mixins/choices/choices.mixin';

type OrderedHotspot = Choice & { order: number | null };

type CorrectableOrderedHotspot = OrderedHotspot & {
  internals: ElementInternals;
  candidateCorrection: 'correct' | 'incorrect' | 'partially-correct' | null;
  orderCorrect: number | null;
};

/**
 * Judges each hotspot's position in the order and paints its pin from the hotspot's verdict state.
 * The answer key is the hotspot's `orderCorrect` (`data-order-correct`), set by
 * `toggleInternalCorrectResponse`; it sets no state on the hotspot.
 */
export class QtiGraphicOrderInteractionCorrection extends CandidateCorrectionMixin(QtiGraphicOrderInteraction) {
  protected override resolvePinColor(choice: OrderedHotspot): string {
    const { internals } = choice as CorrectableOrderedHotspot;
    if (hasState(internals.states, 'candidate-incorrect')) return 'var(--qti-incorrect)';
    if (hasState(internals.states, 'candidate-correct')) return 'var(--qti-correct)';
    return super.resolvePinColor(choice);
  }

  public override toggleInternalCorrectResponse(show: boolean): void {
    super.toggleInternalCorrectResponse(show);
    const response = this.correctResponse;
    const correctOrder = response ? (Array.isArray(response) ? response : [response]) : [];
    for (const hotspot of this._choiceElements as CorrectableOrderedHotspot[]) {
      const index = correctOrder.indexOf(hotspot.identifier);
      hotspot.orderCorrect = show && index >= 0 ? index + 1 : null;
    }
    this.refreshLocatorPins();
  }

  public override toggleCandidateCorrection(show: boolean): void {
    super.toggleCandidateCorrection(show);
    const response = this.correctResponse;
    const correctOrder = response ? (Array.isArray(response) ? response : [response]) : [];
    for (const hotspot of this._choiceElements as CorrectableOrderedHotspot[]) {
      hotspot.candidateCorrection = null;
      if (show && hotspot.order != null) {
        hotspot.candidateCorrection = correctOrder[hotspot.order - 1] === hotspot.identifier ? 'correct' : 'incorrect';
      }
    }
    this.refreshLocatorPins();
  }
}
