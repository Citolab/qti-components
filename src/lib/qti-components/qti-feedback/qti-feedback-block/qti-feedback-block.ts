import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { QtiFeedback } from '../qti-feedback';

@customElement('qti-feedback-block')
export class QtiFeedbackBlock extends QtiFeedback {
  static override styles = css`
    :host {
      display: block;
    }
    .on {
      display: block;
    }
    .off {
      display: none;
    }
  `;

  override render() {
    return html` <slot part="feedback" class="feedback ${this.showStatus}"></slot> `;
  }

  public connectedCallback(): void {
    super.connectedCallback();
    this.checkShowFeedback(this.outcomeIdentifier);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'qti-feedback-block': QtiFeedbackBlock;
  }
}
