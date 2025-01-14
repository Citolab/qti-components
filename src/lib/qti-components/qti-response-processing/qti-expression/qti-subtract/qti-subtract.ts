import { QtiExpression } from '../../../../exports/qti-expression';

type Constructor<T> = new (...args: any[]) => T;
export class QtiSubtract extends qtiSubtractMixin(QtiExpression<any> as unknown as Constructor<QtiExpression<number>>) {
  public override getResult() {
    // children can be a mix of qti-expression and qti-condition-expression
    const value = this.calculateChildren(Array.from(this.children as unknown as QtiExpression<any>[]));
    return value;
  }
}

type MockQtiExpression<T> = { calculate: () => T };
type MockConstructor = new (...args: any[]) => {};

export function qtiSubtractMixin<TBase extends MockConstructor>(Base: TBase) {
  return class MockQtiSubtract extends Base {
    public calculateChildren(children: Array<MockQtiExpression<any>>) {
      // children can be a mix of qti-expression and qti-condition-expression
      const values = children.map(expression => {
        if (!expression.calculate) {
          console.error("Element doesn't implement QtiConditionExpression");
          return null;
        }
        const value = expression.calculate();
        if (Number.isNaN(value)) {
          console.error('Unexpected value in qti-subtract, expected number');
          return null;
        }
        return Number(value);
      });
      if (values.some(value => value === null)) {
        console.error('One or more child expressions returned invalid values');
        return 0;
      }
      // Subtract the two values
      return values[0] - values[1];
    }
  };
}
