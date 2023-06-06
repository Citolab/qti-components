import { LitElement, css, html } from 'lit';

export class QtiSPositionObjectInteraction extends LitElement {
  override render() {
    return html`<slot></slot>`;
  }

  static override styles = [
    css`
      :host {
        display: block;
      }
      ::slotted(img) {
        position: absolute;
        cursor: move;
        user-select: none;
        left: 50%;
        transform: translateX(-50%);
      }
    `
  ];
}

customElements.define('qti-position-object-interaction', QtiSPositionObjectInteraction);
