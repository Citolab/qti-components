import { css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('qti-gap-img')
export class QtiGapImg extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      user-select: none;
    }
  `;

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  override connectedCallback() {
    this.setAttribute('slot', 'drags');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-img': QtiGapImg;
  }
}
