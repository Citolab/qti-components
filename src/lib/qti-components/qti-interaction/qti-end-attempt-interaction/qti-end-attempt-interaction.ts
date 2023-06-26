import { LitElement, html } from 'lit';
import { QtiAssessmentItem } from '../../qti-assessment-item/qti-assessment-item';
import { property } from 'lit/decorators.js';

export class QtiEndAttemptInteraction extends LitElement {
  @property({ type: String })
  public title: 'end attempt';

  override render() {
    return html`<button @click=${this.endAttempt}>${this.title}</button>`;
  }
  public endAttempt(e: Event) {
    (this.closest('qti-assessment-item') as QtiAssessmentItem).processResponse();
  }
}

customElements.define('qti-end-attempt-interaction', QtiEndAttemptInteraction);
