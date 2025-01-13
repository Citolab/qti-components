import { QtiConditionExpression } from '../qti-condition-expression';
import type { QtiExpression } from '../qti-expression';

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
