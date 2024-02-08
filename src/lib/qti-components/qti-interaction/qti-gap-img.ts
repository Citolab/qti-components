import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('qti-gap-img')
export class QtiGapImg extends LitElement {
  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  connectedCallback() {
    this.setAttribute('slot', 'qti-gap-img');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-img': QtiGapImg;
  }
}
