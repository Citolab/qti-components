import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
@customElement('qti-test-part')
export class QtiTestPart extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test-part': QtiTestPart;
  }
}
