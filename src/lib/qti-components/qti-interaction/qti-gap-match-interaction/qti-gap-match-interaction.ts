import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { Interaction } from '../../../exports/interaction';
import styles from './qti-gap-match-interaction.styles';

import type { ResponseVariable } from '../../../exports/variables';
import type { CSSResultGroup } from 'lit';
@customElement('qti-gap-match-interaction')
export class QtiGapMatchInteraction extends DragDropInteractionMixin(
  Interaction,
  'qti-gap-text',
  'qti-gap',
  `slot[part='drags']`
) {
  static styles: CSSResultGroup = styles;

  override render() {
    return html`<slot name="prompt"> </slot>
      <slot part="drags" name="drags"></slot>
      <slot part="drops"></slot>
      <div role="alert" id="validationMessage"></div>`;
  }

  public toggleCorrectResponse(responseVariable: ResponseVariable, show: boolean): void {
    if (show && responseVariable.correctResponse) {
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
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-match-interaction': QtiGapMatchInteraction;
  }
}
