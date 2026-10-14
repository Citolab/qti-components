import { QtiExpression } from '@qti-components/base';

import { isNullValue } from '../../is-null-value';

import type { ResponseVariable } from '@qti-components/base';

export class QtiLt extends QtiExpression<boolean> {
  public override getResult(): boolean {
    if (this.children.length === 2) {
      const values = this.getVariables() as ResponseVariable[];
      const value1 = values[0];
      const value2 = values[1];
      // A comparison with NULL is NULL (false in a condition). Without this, "+null" is 0 and a
      // missing response would pass a comparison like lte(RESPONSE, 5).
      if (isNullValue(value1?.value) || isNullValue(value2?.value)) {
        return null;
      }
      if (
        (value1.baseType === 'integer' || value1.baseType === 'float') &&
        (value2.baseType === 'integer' || value2.baseType === 'float')
      ) {
        return +value1.value < +value2.value;
      } else {
        console.error('unexpected baseType or cardinality in qti lt');
      }
    }
    console.error('unexpected number of children in lt');
    return null;
  }
}
