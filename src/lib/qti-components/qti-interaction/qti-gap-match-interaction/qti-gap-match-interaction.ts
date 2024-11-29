import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';
import { Interaction } from '../internal/interaction/interaction';

@customElement('qti-gap-match-interaction')
export class QtiGapMatchInteraction extends DragDropInteractionMixin(Interaction, 'qti-gap-text', false, 'qti-gap') {
  static override styles = [
    css`
      :host {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        gap: 0.5rem;
      }

      :host(.qti-choices-top) {
        flex-direction: column;
      }
      :host(.qti-choices-bottom) {
        flex-direction: column-reverse;
      }
      :host(.qti-choices-left) {
        flex-direction: row;
      }
      :host(.qti-choices-right) {
        flex-direction: row-reverse;
      }
      /* [part='drops'] , */
      [part='drags'] {
        display: flex;
        align-items: flex-start;
        flex: 1;
        gap: 0.5rem;
      }
    `
  ];

  override render() {
    return html`<slot name="prompt"> </slot>
      <slot part="drags" name="qti-gap-text"></slot>
      <slot part="drops"></slot>
      <div role="alert" id="validationMessage"></div>`;
  }

  set correctResponse(value: string | string[]) {
    let matches: { text: string; gap: string }[] = [];
    const response = Array.isArray(value) ? value : [value];

    if (response) {
      matches = response.map(x => {
        const split = x.split(' ');
        return { text: split[0], gap: split[1] };
      });
    }

    const gaps = this.querySelectorAll('qti-gap');
    gaps.forEach((gap, index) => {
      const identifier = gap.getAttribute('identifier');
      const textIdentifier = matches.find(x => x.gap === identifier)?.text;
      const text = this.querySelector(`qti-gap-text[identifier="${textIdentifier}"]`)?.textContent.trim();
      if (textIdentifier && text) {
        if (!gap.nextElementSibling?.classList.contains('correct-option')) {
          const textSpan = document.createElement('span');
          textSpan.classList.add('correct-option');
          textSpan.textContent = text;
          gap.insertAdjacentElement('afterend', textSpan);
        }
      } else if (gap.nextElementSibling?.classList.contains('correct-option')) {
        gap.nextElementSibling.remove();
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-match-interaction': QtiGapMatchInteraction;
  }
}
