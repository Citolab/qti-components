import { LitElement, html } from 'lit';
import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import { property } from 'lit/decorators.js';

export class QtPrintedVariable extends LitElement {
  @property({ type: String })
  value = '';

  override render() {
    return html`${this.value}`;
  }

  constructor() {
    super();
    const assessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.addEventListener('qti-outcome-changed', () => {
      this.value = this.calculate() as string;
    });
  }

  public calculate() {
    const assessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
    const identifier = this.getAttribute('identifier');
    const result = assessmentItem.getVariableValue(identifier);
    return result;
  }
}

customElements.define('qti-printed-variable', QtPrintedVariable);
