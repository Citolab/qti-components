import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-truncate operator removes fractional parts of a number.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#truncate
 *
 * Takes 1 numerical sub-expression of single cardinality.
 * Returns integer formed by truncating value toward zero.
 * Special cases: Returns NULL if input is NULL or NaN.
 */
export class QtiTruncate extends QtiExpression<number | null> {
  public override getResult(): number | null {
    const variables = this.getVariables() as ResponseVariable[];

    if (variables.length !== 1) {
      console.error('qti-truncate requires exactly one child expression');
      return null;
    }

    const variable = variables[0];
    if (variable.cardinality !== 'single' || Array.isArray(variable.value)) {
      console.error('qti-truncate requires single cardinality');
      return null;
    }
    if (variable.baseType !== 'integer' && variable.baseType !== 'float') {
      console.error('qti-truncate requires numerical base-type');
      return null;
    }
    if (variable.value === null || variable.value === undefined) {
      return null;
    }

    const value = Number.parseFloat(variable.value as string);
    if (Number.isNaN(value)) {
      console.error('qti-truncate requires a numerical value');
      return null;
    }

    return Math.trunc(value);
  }
}

customElements.define('qti-truncate', QtiTruncate);
