import { QtiAssessmentItem } from '../../../qti-assessment-item/qti-assessment-item';
import { QtiExpression } from '../qti-expression';

export class QtiCorrect extends QtiExpression<string | string[]> {
  get interpretation() {
    return this.getAttribute('interpretation') || '';
  }

  override getResult() {
    const identifier = this.getAttribute('identifier') || '';
    const responseVariable = (this.closest('qti-assessment-item') as QtiAssessmentItem).getResponse(identifier);
    if (responseVariable.cardinality !== 'single') {
      return responseVariable.correctResponse.length > 0 ? responseVariable.correctResponse[0] : '';
    } else {
      return responseVariable.correctResponse;
    }
  }
}

customElements.define('qti-correct', QtiCorrect);
