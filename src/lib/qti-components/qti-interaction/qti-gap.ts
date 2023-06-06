import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class QtiGap extends LitElement {
  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  override render() {
    return html` <slot name="qti-gap-text"></slot>`;
  }
}

customElements.define('qti-gap', QtiGap);
