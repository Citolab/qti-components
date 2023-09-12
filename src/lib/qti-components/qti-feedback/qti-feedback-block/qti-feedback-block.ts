import { PropertyValueMap, css, html } from 'lit';
import { QtiFeedback } from '../qti-feedback';

export class QtiFeedbackBlock extends QtiFeedback {
  static override styles = css`
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

  // protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
  //   this.checkShowFeedback(this.outcomeIdentifier);
  // }
}

customElements.define('qti-feedback-block', QtiFeedbackBlock);
