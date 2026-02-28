import { QtiExpression } from '@qti-components/base';

import type { QtiExpressionBase } from '@qti-components/base';

export class QtiSum extends QtiExpression<number> {
  public override getResult() {
    // children can be a mix of qti-expression and qti-condition-expression
    const expression = new QtiSumExpression(Array.from(this.children as unknown as QtiExpressionBase<number>[]));
    const value = expression.calculate();
    return value;
  }
}

export class QtiSumExpression implements QtiExpressionBase<number> {
  constructor(private expressions: QtiExpressionBase<number>[]) {}

  public calculate() {
    const expressions = this.expressions.filter(c => c.calculate !== undefined);
    // check if one expresssion returns null
    if (expressions.some(c => c.calculate() === null)) {
      return null;
    }

    const values = this.expressions.map(c => {
      const value = c.calculate();
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
