import { PropertyValueMap, html } from 'lit';
import { QtiFeedback } from '../qti-feedback';

export class QtiFeedbackBlock extends QtiFeedback {
  override render() {
    return html`
      <style>
        .on {
          display: block;
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

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.checkShowFeedback(this.outcomeIdentifier);
  }
}

customElements.define('qti-feedback-block', QtiFeedbackBlock);
