import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
export class QtiInlineChoice extends LitElement {
  static override get styles() {
    return [
      css`
        :host {
          display: block;
          cursor: pointer;
        }
      `
    ];
  }

  @property({ type: String })
  identifier: string;

  override connectedCallback() {
    super.connectedCallback();

    this.addEventListener('click', this.#onSelectInlineChoice);

    this.dispatchEvent(
      new CustomEvent('qti-inline-choice-register', {
        bubbles: true,
        composed: true,
        cancelable: false
      })
    );
  }

  override disconnectedCallback() {
    this.removeEventListener('click', this.#onSelectInlineChoice);
  }

  override render() {
    return html` <slot></slot> `;
  }

  #onSelectInlineChoice() {
    // if (this.disabled || this.readonly) return;

    this.dispatchEvent(
      new CustomEvent('qti-inline-choice-select', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: { identifier: this.identifier }
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-inline-choice': QtiInlineChoice;
  }
}
