import { css, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { QtiFeedback } from '@qti-components/base';

import { dispatchFeedback } from '../../internal/feedback-events';

/**
 * Inline feedback: shown or hidden by the outcome it is bound to.
 *
 * @slot - The feedback content.
 *
 * @csspart feedback - The feedback box.
 */
export class QtiFeedbackInline extends QtiFeedback {
  static override styles = css`
    .on {
      display: inline-block;
    }
    .off {
      display: none;
    }
  `;

  override render = () => html` <slot part="feedback" class="${ifDefined(this.showStatus)}"></slot> `;

  /** `qc-feedback-show`: a listener that calls `preventDefault()` keeps this hidden and shows it itself. */
  protected override feedbackShowing(): boolean {
    return dispatchFeedback(this, 'qc-feedback-show', 'inline', this.identifier);
  }

  protected override feedbackHiding(): boolean {
    return dispatchFeedback(this, 'qc-feedback-hide', 'inline', this.identifier);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.checkShowFeedback(this.outcomeIdentifier);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-feedback-inline': QtiFeedbackInline;
  }
}
