import { html } from 'lit';
import { QtiExpression } from '../qti-expression';

export class QtiSum extends QtiExpression<number> {
  public override calculate() {
    // children can be a mix of qti-expression and qti-condition-expression
    const values = Array.from(this.children).map(c => {
      const condition = c as QtiExpression<number>;
      if (!condition.calculate) {
        console.error("Element doesn't implement QtiConditionExpression");
        return null;
      }
      const value = condition.calculate();
      if (Number.isNaN(value)) {
        console.error('unexpected value in qti-sum, expected number');
        return null;
      }

      return Number(value);
    });
    return values.reduce((a, b) => a + b, 0);
  }
}

customElements.define('qti-sum', QtiSum);
