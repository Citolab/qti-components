import { QtiConditionExpression } from '../qti-condition-expression';
import { QtiExpression } from '../qti-expression';

type Constructor<T> = new (...args: any[]) => T;
export class QtiAnd extends qtiAndMixin(QtiConditionExpression as unknown as Constructor<QtiConditionExpression>) {
  public calculate() {
    return this.calculateChildren(Array.from(this.children as unknown as QtiExpression<any>[]));
  }
}

export type MockQtiExpression<T> = { calculate: () => T };
type MockConstructor = new (...args: any[]) => {};
export function qtiAndMixin<TBase extends MockConstructor>(Base: TBase) {
  return class MockQtiAnd extends Base {
    public calculateChildren(children: Array<MockQtiExpression<any>>) {
      // children can be a mix of qti-expression and qti-condition-expression
      const values = children.map(c => {
        const condition = c as MockQtiExpression<any>;
        if (!condition.calculate) {
          console.error("Element doesn't implement QtiConditionExpression");
          return null;
        }
        let value = condition.calculate() as Boolean;
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
  };
}
