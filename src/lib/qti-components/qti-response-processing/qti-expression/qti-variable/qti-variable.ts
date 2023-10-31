import { html } from 'lit';
import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import { QtiExpression } from '../qti-expression';

export class QtiVariable extends QtiExpression<string | string[]> {
  public override calculate() {
    const identifier = this.getAttribute('identifier');
    const result = (this.closest('qti-assessment-item') as QtiAssessmentItem).getVariable(identifier).value;
    return result;
  }
}

customElements.define('qti-variable', QtiVariable);
