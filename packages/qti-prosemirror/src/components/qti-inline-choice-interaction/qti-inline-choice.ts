import { css, html, LitElement } from 'lit';
export class QtiInlineChoice extends LitElement {
  override render() {
    return html` <slot></slot> `;
  }
}

customElements.define('qti-inline-choice', QtiInlineChoice);
