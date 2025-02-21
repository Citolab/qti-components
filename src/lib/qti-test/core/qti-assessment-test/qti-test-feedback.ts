import { customElement } from 'lit/decorators.js';
import { css, html } from 'lit';

import { QtiModalFeedback } from '../../../qti-components';

@customElement('qti-test-feedback')
export class QtiTestFeedback extends QtiModalFeedback {
  static styles = css`
    :host {
      color: gray;
    }
  `;
  override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test-feedback': QtiTestFeedback;
  }
}
