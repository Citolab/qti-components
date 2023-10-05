import { LitElement, html } from 'lit';
import { QtiAssessmentItem } from '../../qti-assessment-item/qti-assessment-item';
import { customElement, property } from 'lit/decorators.js';

@customElement('qti-end-attempt-interaction')
export class QtiEndAttemptInteraction extends LitElement {
  @property({ type: String, attribute: 'response-identifier' })
  public responseIdentifier: string;

  @property({ type: String, attribute: 'count-attempt' })
  public countAttempt: string = 'true';

  @property({ type: String })
  public title: 'end attempt';

  override render() {
    return html`<button @click=${this.endAttempt}>${this.title}</button>`;
  }
  public endAttempt(e: Event) {
    const assessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable(this.responseIdentifier, 'true');
    assessmentItem.processResponse(this.countAttempt === 'true');
  }
}
