import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { QtiFeedback } from '../qti-feedback';

import type { PropertyValueMap } from 'lit';

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

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.checkShowFeedback(this.outcomeIdentifier);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-feedback-inline': QtiFeedbackInline;
  }
}
