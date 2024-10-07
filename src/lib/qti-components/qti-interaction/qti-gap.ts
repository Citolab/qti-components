import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('qti-gap')
export class QtiGap extends LitElement {
  static styles = css`
    :host {
      display: flex;
      user-select: none;
    }
  `;

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  override render() {
    return html` <slot name="qti-gap-text"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap': QtiGap;
  }
}
