import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('qti-gap')
export class QtiGap extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      user-select: none;
      min-height: var(--qti-gap-min-height, 2rem);
      min-width: var(--qti-gap-min-width, 6rem);
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
