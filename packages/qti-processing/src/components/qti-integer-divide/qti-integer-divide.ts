import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-integer-divide operator performs integer division rounded down.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#integerDivide
 *
 * Takes 2 sub-expressions with base-type integer and single cardinality.
 * Returns result of (x / y) rounded down toward negative infinity.
 * Special cases: Returns NULL if any argument is NULL or if divisor is 0.
 */
export class QtiIntegerDivide extends QtiExpression<number | null> {
  public override getResult(): number | null {
    const values = this.#collectIntegerValues(this.getVariables() as ResponseVariable[]);

    if (values.length !== 2) {
      console.error('qti-integer-divide requires exactly 2 integer values');
      return null;
    }

    if (values[1] === 0) {
      console.error('qti-integer-divide: division by zero');
      return null;
    }

    return Math.floor(values[0] / values[1]);
  }

  #collectIntegerValues(variables: ResponseVariable[]): number[] {
    const values: number[] = [];

    for (const variable of variables) {
      if (variable.baseType !== 'integer') {
        console.error('qti-integer-divide requires integer base-type');
        return [];
      }
      if (variable.cardinality !== 'single' || Array.isArray(variable.value)) {
        console.error('qti-integer-divide requires single cardinality');
        return [];
      }
      if (variable.value === null || variable.value === undefined) {
        return [];
      }

      const value = Number.parseInt(variable.value as string, 10);
      if (Number.isNaN(value)) {
        console.error('qti-integer-divide requires integer values');
        return [];
      }
      values.push(value);
    }

    return values;
  }
}

customElements.define('qti-integer-divide', QtiIntegerDivide);
