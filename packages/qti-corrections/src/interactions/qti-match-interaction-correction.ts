import { QtiMatchInteraction } from '@qti-components/match-interaction/elements';

import { DragDropCorrectionMixin } from '../mixins/drag-drop-correction.mixin';
import { parsePairs, type CorrectableChoice } from './shared';

export class QtiMatchInteractionCorrection extends DragDropCorrectionMixin(QtiMatchInteraction) {
  #correctPairs = new Set<string>();

  public override toggleCandidateCorrection(show: boolean): void {
    super.toggleCandidateCorrection(show);
    const matches = parsePairs(this.correctResponse);
    this.#correctPairs = show ? new Set(matches.map(match => `${match.source} ${match.target}`)) : new Set();

    for (const target of this.targetChoices) {
      const targetId = target.getAttribute('identifier');
      const selectedChoices = (target as unknown as { drags: readonly CorrectableChoice[] }).drags;
      for (const choice of selectedChoices) {
        choice.candidateCorrection = null;
        if (show) {
          choice.candidateCorrection = this.#correctPairs.has(`${choice.identifier} ${targetId}`)
            ? 'correct'
            : 'incorrect';
        }
      }
    }
    this.requestUpdate();
  }

  protected override getCellStateVariant(value: string, checked: boolean): string {
    if (!this.showCandidateCorrection || !checked) return '';
    return this.#correctPairs.has(value) ? 'correct' : 'incorrect';
  }
}
