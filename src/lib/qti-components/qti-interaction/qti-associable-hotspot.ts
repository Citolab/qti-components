import { LitElement, css, html } from 'lit';

export class QtiAssociableHotspot extends LitElement {
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
  static override styles = css`
    :host {
      position: absolute;
    }
  `;

  override render() {
    return html` <slot name="qti-gap-img"></slot> `;
  }
}

customElements.define('qti-associable-hotspot', QtiAssociableHotspot);
