import { LitElement, html } from 'lit';
import { QtiAssessmentItem } from '../../qti-assessment-item/qti-assessment-item';
import { customElement, property } from 'lit/decorators.js';
import { Interaction } from '../internal/interaction/interaction';
@customElement('qti-end-attempt-interaction')
export class QtiEndAttemptInteraction extends Interaction {
  @property({ type: String, attribute: 'count-attempt' })
  public countAttempt: string = 'true';

  @property({ type: String })
  public title: 'end attempt';

  validate(): boolean {
    // throw new Error('Method not implemented.');
    return true;
  }
  set response(val: undefined) {
    // throw new Error('Method not implemented.');
  }

  override render() {
    return html`<button ?disabled=${this.disabled} part="button" @click=${this.endAttempt}>${this.title}</button>`;
  }
  public endAttempt(e: Event) {
    this.dispatchEvent(
      new CustomEvent('end-attempt', {
        bubbles: true,
        composed: true,
        detail: { responseIdentifier: this.responseIdentifier, countAttempt: this.countAttempt === 'true' }
      })
    );
  }
}
