import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
export class QtiGap extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      user-select: none;
    }
  `;

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  override render() {
    return html` <slot name="drags"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap': QtiGap;
  }
}
