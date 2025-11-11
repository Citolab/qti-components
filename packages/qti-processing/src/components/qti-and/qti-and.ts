import { customElement } from 'lit/decorators.js';

import { QtiConditionExpression } from '@qti-components/base';

import type { QtiExpression } from '@qti-components/base';

type Constructor<T> = new (...args: any[]) => T;

@customElement('qti-and')
export class QtiAnd extends qtiAndMixin(QtiConditionExpression as unknown as Constructor<QtiConditionExpression>) {
  public override calculate() {
    return this.calculateChildren(Array.from(this.children as unknown as QtiExpression<any>[]));
  }
}

type MockQtiExpression<T> = { calculate: () => T };
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
      return values.every(e => {
        return typeof e === 'boolean' && e;
      });
    }
  };
}
