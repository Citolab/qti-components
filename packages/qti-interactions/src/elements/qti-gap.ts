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

    :host(.qti-input-width-1) {
      width: 1.1rem;
      min-width: 1.1rem;
    }

    :host(.qti-input-width-2) {
      width: 2.3rem;
      min-width: 2.3rem;
    }

    :host(.qti-input-width-3) {
      width: 3.3rem;
      min-width: 3.3rem;
    }

    :host(.qti-input-width-4) {
      width: 4.2rem;
      min-width: 4.2rem;
    }

    :host(.qti-input-width-6) {
      width: 6.6rem;
      min-width: 6.6rem;
    }

    :host(.qti-input-width-10) {
      width: 8rem;
      min-width: 8rem;
    }

    :host(.qti-input-width-15) {
      width: 12rem;
      min-width: 12rem;
    }

    :host(.qti-input-width-20) {
      width: 17rem;
      min-width: 17rem;
    }

    :host(.qti-input-width-25) {
      width: 20rem;
      min-width: 20rem;
    }

    :host(.qti-input-width-30) {
      width: 24rem;
      min-width: 24rem;
    }

    :host(.qti-input-width-35) {
      width: 28rem;
      min-width: 28rem;
    }

    :host(.qti-input-width-40) {
      width: 32rem;
      min-width: 32rem;
    }

    :host(.qti-input-width-45) {
      width: 36rem;
      min-width: 36rem;
    }

    :host(.qti-input-width-50) {
      width: 40rem;
      min-width: 40rem;
    }

    :host(.qti-input-width-72) {
      width: 57rem;
      min-width: 57rem;
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
