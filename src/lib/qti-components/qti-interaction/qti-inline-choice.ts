import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('qti-inline-choice')
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

    this.addEventListener('click', this._onSelectInlineChoice);

    this.dispatchEvent(
      new CustomEvent('qti-inline-choice-register', {
        bubbles: true,
        composed: true,
        cancelable: false
      })
    );
  }

  override disconnectedCallback() {
    this.removeEventListener('click', this._onSelectInlineChoice);
  }

  override render() {
    return html` <slot></slot> `;
  }

  private _onSelectInlineChoice() {
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
