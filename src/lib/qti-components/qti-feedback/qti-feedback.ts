import { LitElement, PropertyValueMap } from 'lit';
import { property } from 'lit/decorators.js';
import { QtiAssessmentItem } from '../qti-assessment-item/qti-assessment-item';

export abstract class QtiFeedback extends LitElement {
  @property({ type: String, attribute: 'show-hide' })
  protected showHide: string;

  @property({ type: String, attribute: 'outcome-identifier' })
  public outcomeIdentifier: string;

  @property({ type: String })
  protected identifier: string;

  @property({ type: String, attribute: false })
  protected showStatus: string;

  public override connectedCallback() {
    super.connectedCallback();
    this.dispatchEvent(
      new CustomEvent<QtiFeedback>('qti-register-feedback', {
        bubbles: true,
        composed: true,
        detail: this
      })
    );
  }

  public checkShowFeedback(outcomeIdentifier: string) {
    const outComeVariable = (this.closest('qti-assessment-item') as QtiAssessmentItem).getOutcome(outcomeIdentifier);

    if (this.outcomeIdentifier !== outcomeIdentifier || !outComeVariable) return;

    let isFound = false;
    if (Array.isArray(outComeVariable.value)) {
      isFound = outComeVariable.value.includes(this.identifier);
    } else {
      isFound = this.identifier === outComeVariable.value;
    }

    this.showFeedback(isFound);
  }

  private showFeedback(value: boolean) {
    this.showStatus = (value && this.showHide === 'show') || (!value && this.showHide === 'hide') ? 'on' : 'off';
  }
}
