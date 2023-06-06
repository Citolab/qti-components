import { html, LitElement } from 'lit';
import { DragDropInteractionMixin } from '../internal/drag-drop/drag-drop-interaction-mixin';

import '../qti-simple-associable-choice';

export class QtiMatchInteraction extends DragDropInteractionMixin(
  LitElement,
  'qti-simple-match-set:first-of-type qti-simple-associable-choice',
  false,
  'qti-simple-match-set:last-of-type qti-simple-associable-choice'
) {
  static override styles = [];
  rows: Element[];
  cols: Element[];

  connectedCallback(): void {
    super.connectedCallback();
    this.rows = Array.from(this.querySelectorAll('qti-simple-match-set:first-of-type qti-simple-associable-choice'));
    this.cols = Array.from(this.querySelectorAll('qti-simple-match-set:last-of-type qti-simple-associable-choice'));
  }
  override render() {
    if (!this.classList.contains('qti-match-tabular')) {
      return html`<slot name="prompt"></slot> <slot></slot>`;
    }
    return html`<table>
      <tr>
        <td><slot name="prompt"></slot></td>
        ${this.cols.map((col, i) => html`<th>${col.innerHTML}</th>`)}
      </tr>
      ${this.rows.map(
        row => html`<tr>
          <td>${row.innerHTML}</td>
          ${this.cols.map((_, i) => html`<td><input type="checkbox" /></td>`)}
        </tr>`
      )}
    </table>`;
  }
}

customElements.define('qti-match-interaction', QtiMatchInteraction);
