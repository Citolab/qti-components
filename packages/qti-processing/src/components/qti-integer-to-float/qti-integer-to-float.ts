import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-integer-to-float operator converts an integer to a float.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#integerToFloat
 *
 * Takes 1 sub-expression with base-type integer and single cardinality.
 * Returns a value of base-type float with the same numeric value.
 * Special cases: Returns NULL if sub-expression is NULL.
 */
export class QtiIntegerToFloat extends QtiExpression<number | null> {
  public override getResult(): number | null {
    const variables = this.getVariables() as ResponseVariable[];

    if (variables.length !== 1) {
      console.error('qti-integer-to-float requires exactly one child expression');
      return null;
    }

    const variable = variables[0];
    if (variable.baseType !== 'integer') {
      console.error('qti-integer-to-float requires integer base-type');
      return null;
    }
    if (variable.cardinality !== 'single' || Array.isArray(variable.value)) {
      console.error('qti-integer-to-float requires single cardinality');
      return null;
    }
    if (variable.value === null || variable.value === undefined) {
      return null;
    }

    const value = Number.parseInt(variable.value as string, 10);
    if (Number.isNaN(value)) {
      console.error('qti-integer-to-float requires an integer value');
      return null;
    }

    return value;
  }
}

customElements.define('qti-integer-to-float', QtiIntegerToFloat);
