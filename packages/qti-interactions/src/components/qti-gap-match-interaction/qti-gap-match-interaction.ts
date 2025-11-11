import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';

import { DragDropInteractionMixin } from '../../mixins/drag-drop/drag-drop-interaction-mixin.js';
import styles from './qti-gap-match-interaction.styles.js';

import type { ResponseVariable } from '@qti-components/base';
import type { QtiGap } from '../../elements/qti-gap';
import type { CSSResultGroup } from 'lit';
@customElement('qti-gap-match-interaction')
export class QtiGapMatchInteraction extends DragDropInteractionMixin(
  Interaction,
  'qti-gap-text',
  'qti-gap',
  `slot[part='drags']`
) {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<slot name="prompt"> </slot>
      <slot part="drags" name="drags"></slot>
      <slot part="drops"></slot>
      <div role="alert" part="message" id="validation-message"></div>`;
  }

  public override toggleCorrectResponse(show: boolean): void {
    const responseVariable = this.responseVariable;

    if (show && responseVariable?.correctResponse) {
      let matches: { text: string; gap: string }[] = [];
      const response = Array.isArray(responseVariable.correctResponse)
        ? responseVariable.correctResponse
        : [responseVariable.correctResponse];

      if (response) {
        matches = response.map(x => {
          const split = x.split(' ');
          return { text: split[0], gap: split[1] };
        });
      }

      const gaps = this.querySelectorAll('qti-gap');
      gaps.forEach(gap => {
        const identifier = gap.getAttribute('identifier');
        const textIdentifier = matches.find(x => x.gap === identifier)?.text;
        const text = this.querySelector(`qti-gap-text[identifier="${textIdentifier}"]`)?.textContent.trim();
        if (textIdentifier && text) {
          if (!gap.nextElementSibling?.classList.contains('correct-option')) {
            const textSpan = document.createElement('span');
            textSpan.classList.add('correct-option');
            textSpan.textContent = text;

            // Apply styles
            textSpan.style.border = '1px solid var(--qti-correct)';
            textSpan.style.borderRadius = '4px';
            textSpan.style.padding = '2px 4px';
            textSpan.style.display = 'inline-block';

            gap.insertAdjacentElement('afterend', textSpan);
          }
        } else if (gap.nextElementSibling?.classList.contains('correct-option')) {
          gap.nextElementSibling.remove();
        }
      });
    } else {
      const correctOptions = this.querySelectorAll('.correct-option');
      correctOptions.forEach(option => {
        option.remove();
      });
    }
  }

  private getMatches(responseVariable: ResponseVariable): { source: string; target: string }[] {
    if (!responseVariable.correctResponse) {
      return [];
    }
    const correctResponse = Array.isArray(responseVariable.correctResponse)
      ? responseVariable.correctResponse
      : [responseVariable.correctResponse];

    const matches: { source: string; target: string }[] = [];
    if (correctResponse) {
      correctResponse.forEach(x => {
        const split = x.split(' ');
        matches.push({ source: split[0], target: split[1] });
      });
    }
    return matches;
  }

  public override toggleCandidateCorrection(show: boolean) {
    const responseVariable = this.responseVariable;

    if (!responseVariable?.correctResponse) {
      return;
    }
    const matches = this.getMatches(responseVariable);

    const targetChoices = Array.from<QtiGap>(this.querySelectorAll('qti-gap'));
    targetChoices.forEach(targetChoice => {
      const targetId = targetChoice.getAttribute('identifier');
      const targetMatches = matches.filter(m => m.target === targetId);

      const selectedChoices = targetChoice.querySelectorAll(`qti-gap-text`);

      selectedChoices.forEach(selectedChoice => {
        selectedChoice.internals.states.delete('candidate-correct');
        selectedChoice.internals.states.delete('candidate-incorrect');

        if (!show) {
          return;
        }

        const isCorrect = targetMatches.find(m => m.source === selectedChoice.identifier)?.source !== undefined;
        if (isCorrect) {
          selectedChoice.internals.states.add('candidate-correct');
        } else {
          selectedChoice.internals.states.add('candidate-incorrect');
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
