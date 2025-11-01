import { QtiExpression } from '../../../../../src/lib/exports/qti-expression';

import type { ResponseVariable } from '../../../../../src/lib/exports/variables';

export class QtiCorrect extends QtiExpression<string | string[]> {
  get interpretation() {
    return this.getAttribute('interpretation') || '';
  }

  override getResult() {
    const identifier = this.getAttribute('identifier') || '';
    const responseVariable: ResponseVariable = this.context.variables.find(v => v.identifier === identifier) || null;
    if (responseVariable.cardinality !== 'single') {
      return responseVariable.correctResponse.length > 0 ? responseVariable.correctResponse[0] : '';
    } else {
      return responseVariable.correctResponse;
    }
  }
}

customElements.define('qti-correct', QtiCorrect);
