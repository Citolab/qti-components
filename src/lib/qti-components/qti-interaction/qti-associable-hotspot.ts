import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('qti-associable-hotspot')
export class QtiAssociableHotspot extends LitElement {
  static styles = css`
    :host {
      display: flex;
      user-select: none;
      position: absolute;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.dispatchEvent(
      new CustomEvent('qti-register-hotspot', {
        bubbles: true,
        cancelable: false,
        composed: true
      })
    );
  }

  override render() {
    return html` <slot name="qti-gap-img"></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-associable-hotspot': QtiAssociableHotspot;
  }
}
