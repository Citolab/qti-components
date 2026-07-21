import { QtiGraphicOrderInteraction } from '@qti-components/graphic-order-interaction/elements';

import { CandidateCorrectionMixin } from '../mixins/candidate-correction.mixin';

import type { Choice } from '@qti-components/interactions-core/mixins/choices/choices.mixin';

type OrderedHotspot = Choice & { order: number | null };

type CorrectableOrderedHotspot = OrderedHotspot & {
  candidateCorrection: 'correct' | 'incorrect' | 'partially-correct' | null;
  orderCorrect: number | null;
};

export class QtiGraphicOrderInteractionCorrection extends CandidateCorrectionMixin(QtiGraphicOrderInteraction) {
  protected override resolvePinColor(choice: OrderedHotspot): string {
    const correctableChoice = choice as CorrectableOrderedHotspot;
    if (correctableChoice.matches(':state(candidate-incorrect)')) return 'var(--qti-incorrect)';
    if (correctableChoice.matches(':state(candidate-correct)')) return 'var(--qti-correct)';
    if (correctableChoice.matches(':state(correct-response)')) return 'var(--qti-answer-border)';
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
