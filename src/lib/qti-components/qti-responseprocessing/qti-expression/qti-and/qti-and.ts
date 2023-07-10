import { html } from 'lit';
import { QtiConditionExpression } from '../qti-condition-expression';
import { QtiExpression } from '../qti-expression';

export class QtiAnd extends QtiConditionExpression {
  public override calculate() {
    // children can be a mix of qti-expression and qti-condition-expression
    const values = Array.from(this.children).map(c => {
      const condition = c as QtiExpression<any>;
      if (!condition.calculate) {
        console.error("Element doesn't implement QtiConditionExpression");
        return null;
      }
      let value = condition.calculate();
      // convert string value to boolean and return null if not possible
      if (typeof value === 'string') {
        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else {
          console.error('unexpected value in qti-and, expected boolean');
          return null;
        }
      }
      return value;
    });
    return values.every(e => {
      return typeof e === 'boolean' && e;
    });
  }
}

customElements.define('qti-and', QtiAnd);
