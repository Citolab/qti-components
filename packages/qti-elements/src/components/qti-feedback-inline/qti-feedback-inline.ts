import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { QtiFeedback } from '@qti-components/base';

@customElement('qti-feedback-inline')
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
