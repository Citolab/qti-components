import { QtiOrderInteraction } from '@qti-components/order-interaction/elements';

import { DragDropCorrectionMixin } from '../mixins/drag-drop-correction.mixin';
import { findCorrectlyPlacedIdentifiers } from '../utils/longest-increasing-subsequence';
import { type CorrectableChoice } from './shared';

export class QtiOrderInteractionCorrection extends DragDropCorrectionMixin(QtiOrderInteraction) {
  public override toggleCandidateCorrection(show: boolean): void {
    super.toggleCandidateCorrection(show);

    const dropTargets = Array.from(this.shadowRoot!.querySelectorAll<HTMLElement>(`[part~='drop']`));
    const placedChoices = dropTargets.flatMap(drop => this.chipsIn(drop) as CorrectableChoice[]);
    for (const choice of placedChoices) choice.candidateCorrection = null;
    if (!show) return;

    const response = this.correctResponse;
    const entries = response ? (Array.isArray(response) ? response : [response]) : [];
    const correctOrder = entries
      .map((entry, index) => {
        const [identifier, dropId] = entry.split(' ');
        const parsed = dropId?.startsWith('droplist') ? parseInt(dropId.slice('droplist'.length), 10) : index;
        return { identifier, dropIndex: Number.isNaN(parsed) ? index : parsed };
      })
      .filter(entry => entry.identifier)
      .sort((a, b) => a.dropIndex - b.dropIndex)
      .map(entry => entry.identifier);
    if (correctOrder.length === 0) return;

    const placedEntries = placedChoices
      .map(choice => ({ choice, identifier: choice.getAttribute('identifier') }))
      .filter((entry): entry is { choice: CorrectableChoice; identifier: string } => Boolean(entry.identifier));
    const correctlyPlaced = findCorrectlyPlacedIdentifiers(
      placedEntries.map(entry => entry.identifier),
      correctOrder
    );
    for (const { choice, identifier } of placedEntries) {
      choice.candidateCorrection = correctlyPlaced.has(identifier) ? 'correct' : 'incorrect';
    }
  }
}
