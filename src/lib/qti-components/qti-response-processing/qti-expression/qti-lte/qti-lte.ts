import { QtiConditionExpression } from '../../../../exports/qti-condition-expression';

import type { ResponseVariable } from '../../../../exports/variables';

// PK: For the contains we assume the expressions to calculate are all directedPairs
// I don't know it this in QTI is always the case however?
export class QtiLte extends QtiConditionExpression {
  public override getResult(): boolean {
    if (this.children.length === 2) {
      const values = this.getVariables() as ResponseVariable[];
      const value1 = values[0];
      const value2 = values[1];
      if (
        (value1.baseType === 'integer' || value1.baseType === 'float') &&
        (value2.baseType === 'integer' || value2.baseType === 'float')
      ) {
        return +value1.value <= +value2.value;
      } else {
        console.error('unexpected baseType or cardinality in qti lte');
        return null;
      }
    }
    console.log('unexpected number of children in lte');
    return null;
  }
}

customElements.define('qti-lte', QtiLte);
