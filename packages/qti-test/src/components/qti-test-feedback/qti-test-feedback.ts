import { css, html } from 'lit';

import { QtiModalFeedback } from '@qti-components/elements/elements';

export class QtiTestFeedback extends QtiModalFeedback {
  static override styles = css`
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
