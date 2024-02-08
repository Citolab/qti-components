import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';

@customElement('qti-gap-match-interaction')
export class QtiGapMatchInteraction extends DragDropInteractionMixin(LitElement, 'qti-gap-text', false, 'qti-gap') {
  static override styles = [
    css`
      :host {
        display: flex;
        align-items: flex-start;
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
      [part='drags'],
      [part='drops'] {
        display: flex;
        align-items: flex-start;
        flex: 1;
        gap: 0.5rem;
      }
    `
  ];

  override render() {
    return html` <slot part="drags" name="qti-gap-text"></slot>
      <slot part="drops"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-match-interaction': QtiGapMatchInteraction;
  }
}
