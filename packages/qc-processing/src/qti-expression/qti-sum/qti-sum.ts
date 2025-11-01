import { QtiExpression } from '@qti-components/shared';

import type { QtiExpressionBase } from '@qti-components/shared';

export class QtiSum extends QtiExpression<number> {
  private _expression: QtiSumExpression;
  constructor() {
    super();
    this._expression = new QtiSumExpression(Array.from(this.children as unknown as QtiExpressionBase<number>[]));
  }

  public override getResult() {
    // children can be a mix of qti-expression and qti-condition-expression
    const value = this._expression.calculate();
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
