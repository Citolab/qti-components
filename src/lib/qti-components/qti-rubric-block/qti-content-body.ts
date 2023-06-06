import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('qti-content-body')
export class qtiContentBody extends LitElement {
  override render() {
    return html`<slot></slot>`;
  }
}
