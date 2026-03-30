import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-round operator rounds a numerical value to the nearest integer.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#round
 *
 * Takes 1 numerical sub-expression of single cardinality.
 * Returns integer n for input in range [n-0.5, n+0.5).
 * Special cases: Returns NULL if input is NULL or NaN.
 */
export class QtiRound extends QtiExpression<number | null> {
  public override getResult(): number | null {
    if (this.children.length !== 1) {
      console.error('qti-round must have exactly one child expression');
      return null;
    }

    const variables = this.getVariables() as ResponseVariable[];
    if (!variables || variables.length === 0) {
      return null;
    }

    const variable = variables[0];

    // Check cardinality
    if (variable.cardinality !== 'single') {
      console.error('qti-round requires single cardinality');
      return null;
    }

    // Check if value is array (shouldn't be for single cardinality)
    if (Array.isArray(variable.value)) {
      console.error('qti-round unexpected array value for single cardinality');
      return null;
    }

    // Handle null values
    if (variable.value === null || variable.value === undefined) {
      return null;
    }

    // Check base type
    if (variable.baseType !== 'integer' && variable.baseType !== 'float') {
      console.error('qti-round requires numerical base-type (integer or float)');
      return null;
    }

    // Convert to number
    const numericValue = parseFloat(variable.value as string);

    // Handle special cases
    if (isNaN(numericValue)) {
      console.warn('qti-round: NaN input results in NULL');
      return null;
    }

    if (!isFinite(numericValue)) {
      // Handle infinity cases
      if (numericValue === Infinity) {
        return Infinity;
      }
      if (numericValue === -Infinity) {
        return -Infinity;
      }
      return null;
    }

    // Apply QTI rounding rule: result is integer n for all input values in [n-0.5, n+0.5)
    // This means we need to find n such that: n-0.5 <= value < n+0.5
    // Rearranging: n <= value + 0.5 < n + 1
    // So n = floor(value + 0.5)
    return Math.floor(numericValue + 0.5);
  }
}

customElements.define('qti-round', QtiRound);
