import { css, html } from 'lit';

import { QtiFeedback } from '@qti-components/base';

import { dispatchFeedback } from '../../internal/feedback-events';

/**
 * Block feedback: shown or hidden by the outcome it is bound to.
 *
 * @slot - The feedback content.
 *
 * @csspart feedback - The feedback box.
 */
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

  /** `qc-feedback-show`: a listener that calls `preventDefault()` keeps this hidden and shows it itself. */
  protected override feedbackShowing(): boolean {
    return dispatchFeedback(this, 'qc-feedback-show', 'block', this.identifier);
  }

  protected override feedbackHiding(): boolean {
    return dispatchFeedback(this, 'qc-feedback-hide', 'block', this.identifier);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.checkShowFeedback(this.outcomeIdentifier);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'qti-feedback-block': QtiFeedbackBlock;
  }
}
