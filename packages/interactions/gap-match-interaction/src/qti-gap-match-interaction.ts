import { html } from 'lit';

import { Interaction } from '@qti-components/base';
import {
  DragDropSlottedMixin,
  DragDropSlottedSortableMixin
} from '@qti-components/interactions-core/mixins/drag-drop-observables';

// import { DragDropInteractionMixin } from '@qti-components/interactions-core/mixins/drag-drop/drag-drop-interaction-mixin.js';
import styles from './qti-gap-match-interaction.styles.js';

import type { ResponseVariable } from '@qti-components/base';
import type { QtiGap } from '@qti-components/interactions-core/elements/qti-gap';
import type { QtiGapText } from '@qti-components/interactions-core/elements/qti-gap-text';
import type { CSSResultGroup } from 'lit';
/**
 * Drag-and-drop gap-match interaction: candidates drag choices into gap targets.
 *
 * @slot prompt - The prompt shown above the interaction.
 * @slot drags - The draggable choice sources.
 * @slot - Default slot for the drop targets (gaps).
 *
 * @csspart drags - Wrapper around the drag sources slot.
 * @csspart drops - Wrapper around the drop targets slot.
 * @csspart message - Live validation message region (role="alert").
 */
export class QtiGapMatchInteraction extends DragDropSlottedSortableMixin(
  DragDropSlottedMixin(Interaction, 'qti-gap-text', 'qti-gap', `slot[part~='drags']`),
  '[qti-draggable="true"]'
) {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<slot name="prompt"> </slot>
      <slot part="drags" name="drags"></slot>
      <slot part="drops"></slot>
      <div role="alert" part="message" id="validation-message"></div>`;
  }

  #getMatches(): { source: string; target: string }[] {
    const correctResponseValue = this.correctResponse;
    if (!correctResponseValue) {
      return [];
    }
    const correctResponse = Array.isArray(correctResponseValue) ? correctResponseValue : [correctResponseValue];

    const matches: { source: string; target: string }[] = [];
    correctResponse.forEach(x => {
      const split = x.split(' ');
      matches.push({ source: split[0], target: split[1] });
    });
    return matches;
  }

  public override toggleCandidateCorrection(show: boolean) {
    if (!this.correctResponse) {
      return;
    }
    const matches = this.#getMatches();

    const targetChoices = Array.from<QtiGap>(this.querySelectorAll('qti-gap'));
    targetChoices.forEach(targetChoice => {
      const targetId = targetChoice.getAttribute('identifier');
      const targetMatches = matches.filter(m => m.target === targetId);

      // The chips are in the gap's own shadow root now, one boundary deeper than a query can see.
      // The gap knows what it holds; ask it.
      const selectedChoices = targetChoice.drags as readonly QtiGapText[];

      selectedChoices.forEach(selectedChoice => {
        selectedChoice.candidateCorrection = null;

        if (!show) {
          return;
        }

        const isCorrect = targetMatches.find(m => m.source === selectedChoice.identifier)?.source !== undefined;
        if (isCorrect) {
          selectedChoice.candidateCorrection = 'correct';
        } else {
          selectedChoice.candidateCorrection = 'incorrect';
        }
      });
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-match-interaction': QtiGapMatchInteraction;
  }
}
