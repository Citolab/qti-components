import { css, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { QtiFeedback } from '@qti-components/base';

import { dispatchFeedback } from '../../internal/feedback-events';

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

  /** `cito-feedback-show`: a listener that calls `preventDefault()` keeps this hidden and shows it itself. */
  protected override feedbackShowing(): boolean {
    return dispatchFeedback(this, 'cito-feedback-show', 'inline', this.identifier);
  }

  protected override feedbackHiding(): boolean {
    return dispatchFeedback(this, 'cito-feedback-hide', 'inline', this.identifier);
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
