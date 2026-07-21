import { QtiGapMatchInteraction } from '@qti-components/gap-match-interaction/elements';

import { DragDropCorrectionMixin } from '../mixins/drag-drop-correction.mixin';
import { parsePairs, type CorrectableChoice } from './shared';

export class QtiGapMatchInteractionCorrection extends DragDropCorrectionMixin(QtiGapMatchInteraction) {
  public override toggleCandidateCorrection(show: boolean): void {
    super.toggleCandidateCorrection(show);
    const matches = parsePairs(this.correctResponse);

    for (const target of this.querySelectorAll('qti-gap')) {
      const targetId = target.getAttribute('identifier');
      const selectedChoices = (target as unknown as HTMLElement & { drags: readonly CorrectableChoice[] }).drags;
      for (const choice of selectedChoices) {
        choice.candidateCorrection = null;
        if (show && matches.some(match => match.source === choice.identifier && match.target === targetId)) {
          choice.candidateCorrection = 'correct';
        } else if (show) {
          choice.candidateCorrection = 'incorrect';
        }
      }
    }
  }
}
