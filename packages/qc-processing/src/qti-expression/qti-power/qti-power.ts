import { QtiExpression } from '@qti-components/shared';

import type { ResponseVariable } from '@qti-components/shared';

/**
 * @summary The qti-power operator raises the first expression to the power of the second.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.power
 *
 * Takes 2 sub-expressions with single cardinality and numerical base-types.
 * Returns a single float corresponding to the first expression raised to the power of the second.
 * Returns NULL if either expression is NULL or if the result is outside the float value set.
 */
export class QtiPower extends QtiExpression<number | null> {
  public override getResult(): number | null {
    if (this.children.length !== 2) {
      console.error('qti-power must have exactly two child expressions');
      return null;
    }

    const variables = this.getVariables() as ResponseVariable[];
    if (!variables || variables.length !== 2) {
      return null;
    }

    const [base, exponent] = variables;

    // Check cardinality for both expressions
    if (base.cardinality !== 'single' || exponent.cardinality !== 'single') {
      console.error('qti-power requires single cardinality for both expressions');
      return null;
    }

    // Check if values are arrays (shouldn't be for single cardinality)
    if (Array.isArray(base.value) || Array.isArray(exponent.value)) {
      console.error('qti-power unexpected array value for single cardinality');
      return null;
    }

    // Handle null values
    if (base.value === null || base.value === undefined || exponent.value === null || exponent.value === undefined) {
      return null;
    }

    // Check base types
    if (
      (base.baseType !== 'integer' && base.baseType !== 'float') ||
      (exponent.baseType !== 'integer' && exponent.baseType !== 'float')
    ) {
      console.error('qti-power requires numerical base-types');
      return null;
    }

    // Convert to numbers
    const baseValue = parseFloat(base.value as string);
    const exponentValue = parseFloat(exponent.value as string);

    // Check for NaN values
    if (isNaN(baseValue) || isNaN(exponentValue)) {
      console.error('qti-power: non-numerical values encountered');
      return null;
    }

    // Handle special cases that should return NULL according to mathematical rules
    if (baseValue === 0 && exponentValue <= 0) {
      // 0^0, 0^(-n) are undefined
      return null;
    }

    if (baseValue < 0 && !Number.isInteger(exponentValue)) {
      // Negative base with non-integer exponent results in complex number
      return null;
    }

    // Calculate the power
    let result: number;
    try {
      result = Math.pow(baseValue, exponentValue);
    } catch (error) {
      console.error('qti-power: error calculating power:', error);
      return null;
    }

    // Check if result is within valid float range
    if (isNaN(result)) {
      return null;
    }

    // Allow positive and negative infinity as per spec
    if (result === Infinity || result === -Infinity) {
      return result;
    }

    // Check if result is within JavaScript's safe number range
    // This is a practical limit for what can be represented as a float
    if (!isFinite(result)) {
      return null;
    }

    // Additional check for extremely large or small numbers that might cause issues
    if (Math.abs(result) > Number.MAX_VALUE) {
      return null;
    }

    // Check for underflow (extremely small numbers that round to 0)
    if (result !== 0 && Math.abs(result) < Number.MIN_VALUE) {
      return null;
    }
    if (isFinite(result) && result !== 0) {
      // Determine appropriate precision based on the magnitude of the result
      const magnitude = Math.floor(Math.log10(Math.abs(result)));
      const precision = Math.max(0, 14 - magnitude); // Maintain 14 significant digits
      const factor = Math.pow(10, precision);
      result = Math.round(result * factor) / factor;
    }

    return result;
  }
}

customElements.define('qti-power', QtiPower);
