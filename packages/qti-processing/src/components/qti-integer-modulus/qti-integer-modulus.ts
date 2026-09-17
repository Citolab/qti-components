import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-integer-modulus operator returns the remainder of integer division.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#integerModulus
 *
 * Takes 2 sub-expressions with base-type integer and single cardinality.
 * Returns the remainder that goes with qti-integer-divide, which rounds down.
 * Special cases: Returns NULL if any argument is NULL or if divisor is 0.
 */
export class QtiIntegerModulus extends QtiExpression<number | null> {
  public override getResult(): number | null {
    const values = this.#collectIntegerValues(this.getVariables() as ResponseVariable[]);

    if (values.length !== 2) {
      console.error('qti-integer-modulus requires exactly 2 integer values');
      return null;
    }

    if (values[1] === 0) {
      console.error('qti-integer-modulus: division by zero');
      return null;
    }

    // The remainder has to pair with qti-integer-divide, which rounds *down*
    // (Math.floor). JavaScript's % truncates towards zero instead, so for a
    // negative operand the two disagreed: -7 divide 3 gave -3 while -7 % 3 gave
    // -1, where floored division leaves a remainder of 2.
    return values[0] - Math.floor(values[0] / values[1]) * values[1];
  }

  #collectIntegerValues(variables: ResponseVariable[]): number[] {
    const values: number[] = [];

    for (const variable of variables) {
      if (variable.baseType !== 'integer') {
        console.error('qti-integer-modulus requires integer base-type');
        return [];
      }
      if (variable.cardinality !== 'single' || Array.isArray(variable.value)) {
        console.error('qti-integer-modulus requires single cardinality');
        return [];
      }
      if (variable.value === null || variable.value === undefined) {
        return [];
      }

      const value = Number.parseInt(variable.value as string, 10);
      if (Number.isNaN(value)) {
        console.error('qti-integer-modulus requires integer values');
        return [];
      }
      values.push(value);
    }

    return values;
  }
}
