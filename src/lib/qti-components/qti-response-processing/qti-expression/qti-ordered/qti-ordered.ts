import { QtiExpression } from '../../../../exports/qti-expression';

import type { ResponseVariable } from '../../../../exports/variables';
export class QtiOrdered extends QtiExpression<ResponseVariable[]> {
  public override getResult(): ResponseVariable[] {
    const variables = this.getVariables() as ResponseVariable[];
    if (variables.length === 0) {
      console.error('unexpected number of children in qti multiple');
      return null;
    }
    for (const variable of variables) {
      if (variable.cardinality !== 'ordered' && variable.cardinality !== 'single') {
        console.error('unexpected cardinality in qti ordered');
        return [];
      }
    }
    return variables;
  }
}

customElements.define('qti-ordered', QtiOrdered);
