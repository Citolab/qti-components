import { QtiConditionExpression } from '@qti-components/base';

import type { QtiExpression } from '@qti-components/base';

/**
 * @summary The qti-or operator evaluates if any provided boolean expressions are true.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#or
 *
 * Takes 1 or more sub-expressions with base-type boolean and single cardinality.
 * Returns true if at least one sub-expression is true, false if all are false.
 * Special cases: Returns NULL if any sub-expression is NULL and all others are false.
 */
export class QtiOr extends QtiConditionExpression {
  public override getResult() {
    // children can be a mix of qti-expression and qti-condition-expression
    const values = Array.from(this.children).map(c => {
      const condition = c as QtiExpression<any>;
      if (!condition.calculate) {
        console.error("Element doesn't implement QtiConditionExpression");
        return null;
      }
      const value = condition.calculate();
      let val = false;
      // convert string value to boolean and return null if not possible
      if (typeof value === 'string') {
        if (value === 'true') {
          val = true;
        } else if (value === 'false') {
          val = false;
        } else {
          console.error('unexpected val in qti-or, expected boolean');
          return null;
        }
      } else {
        if (typeof value === 'boolean') {
          val = value;
        }
      }
      return val;
    });
    return values.some(e => {
      return typeof e === 'boolean' && e;
    });
  }
}

customElements.define('qti-or', QtiOr);
