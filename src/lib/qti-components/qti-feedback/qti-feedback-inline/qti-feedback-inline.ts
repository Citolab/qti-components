import { css, html } from 'lit';
import { QtiFeedback } from '../qti-feedback';

export class QtiFeedbackInline extends QtiFeedback {
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
customElements.define('qti-feedback-inline', QtiFeedbackInline);
