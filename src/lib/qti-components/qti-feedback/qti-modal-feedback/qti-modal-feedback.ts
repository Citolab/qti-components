import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { QtiFeedback } from '../qti-feedback';

@customElement('qti-modal-feedback')
export class QtiModalFeedback extends QtiFeedback {
  static override styles = css`
    .on {
      display: inline-block;
    }
    .off {
      display: none;
    }
  `;

  override render = () => html` <slot part="feedback" class="${this.showStatus}"></slot> `;
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-modal-feedback': QtiModalFeedback;
  }
}
