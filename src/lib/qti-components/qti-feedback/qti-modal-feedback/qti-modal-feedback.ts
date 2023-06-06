import { html } from 'lit';
import { QtiFeedback } from '../qti-feedback';

export class QtiModalFeedback extends QtiFeedback {
  override render() {
    return html`
      <style>
        .on {
          display: inline-block;
        }
        .off {
          display: none;
        }
      </style>
      <div class="feedback ${this.showStatus}">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('qti-modal-feedback', QtiModalFeedback);
