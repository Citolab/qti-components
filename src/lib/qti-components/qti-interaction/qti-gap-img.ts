import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class QtiGapImg extends LitElement {
  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  connectedCallback() {
    this.setAttribute('slot', 'qti-gap-img');
  }
}

customElements.define('qti-gap-img', QtiGapImg);
