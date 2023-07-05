import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import { QtiExpression } from '../../qti-expression/qti-expression';
import { QtiRule } from '../qti-rule';

export class QtiSetOutcomeValue extends QtiRule {
  public override process() {
    const identifier = this.getAttribute('identifier');
    const expression = this.firstElementChild as QtiExpression<string>;

    const value = expression ? expression.calculate() : null;

    if (value === null || value === undefined) {
      console.warn('setOutcomeValue: value is null or undefined');
      return;
    }
    // const numericScore = parseInt(value.toString());
    // if (isNaN(numericScore)) {
    //   console.error('setOutcomeValue: value is not a number');
    //   return;
    // }
    const qtiAssessmentItem = this.closest('qti-assessment-item') as QtiAssessmentItem;
    qtiAssessmentItem.setOutcomeValue(identifier, value);
  }
}

customElements.define('qti-set-outcome-value', QtiSetOutcomeValue);
