import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('qti-content-body')
export class QtiContentBody extends LitElement {
  override render() {
    return html`<slot></slot>`;
  }
}
