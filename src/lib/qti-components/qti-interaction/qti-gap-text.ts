import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class QtiGapText extends LitElement {
  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('slot', 'qti-gap-text');
  }

  override render() {
    return html`<slot></slot>`;
  }
}

customElements.define('qti-gap-text', QtiGapText);
