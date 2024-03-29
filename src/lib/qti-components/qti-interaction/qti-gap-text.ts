import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('qti-gap-text')
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

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-text': QtiGapText;
  }
}
