import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/shared';

import type { ResponseVariable } from '@qti-components/shared';

/**
 * @summary The qti-math-operator performs mathematical operations on numerical values.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.math-operator
 *
 * Takes 1 or more sub-expressions with single cardinality and numerical base-types.
 * The result is a single float, except for signum, floor and ceil which return integers.
 * Returns NULL if any argument is NULL or falls outside the function's natural domain.
 */
export class QtiMathOperator extends QtiExpression<number | null> {
  @property({ type: String }) name: string = '';

  public override getResult(): number | null {
    if (!this.name) {
      console.error('qti-math-operator requires a name attribute');
      return null;
    }

    const variables = this.getVariables() as ResponseVariable[];
    if (!variables || variables.length === 0) {
      return null;
    }

    // Extract numerical values and validate
    const values: number[] = [];
    for (const variable of variables) {
      // Check cardinality
      if (variable.cardinality !== 'single') {
        console.error('qti-math-operator requires single cardinality');
        return null;
      }

      // Check if value is array (shouldn't be for single cardinality)
      if (Array.isArray(variable.value)) {
        console.error('qti-math-operator unexpected array value for single cardinality');
        return null;
      }

      // Handle null values
      if (variable.value === null || variable.value === undefined) {
        return null;
      }

      // Check base type
      if (variable.baseType !== 'integer' && variable.baseType !== 'float') {
        console.error('qti-math-operator requires numerical base-type');
        return null;
      }

      // Convert to number
      const numValue = parseFloat(variable.value as string);
      if (isNaN(numValue)) {
        console.error('qti-math-operator non-numerical value');
        return null;
      }

      values.push(numValue);
    }

    // Perform the mathematical operation
    return this._performOperation(this.name, values);
  }

  private _performOperation(operation: string, values: number[]): number | null {
    try {
      switch (operation.toLowerCase()) {
        // Single argument functions
        case 'sin':
          if (values.length !== 1) return null;
          return Math.sin(values[0]);

        case 'cos':
          if (values.length !== 1) return null;
          return Math.cos(values[0]);

        case 'tan':
          if (values.length !== 1) return null;
          return Math.tan(values[0]);

        case 'asin':
          if (values.length !== 1) return null;
          if (values[0] < -1 || values[0] > 1) return null; // Outside domain
          return Math.asin(values[0]);

        case 'acos':
          if (values.length !== 1) return null;
          if (values[0] < -1 || values[0] > 1) return null; // Outside domain
          return Math.acos(values[0]);

        case 'atan':
          if (values.length !== 1) return null;
          return Math.atan(values[0]);

        case 'sinh':
          if (values.length !== 1) return null;
          return Math.sinh(values[0]);

        case 'cosh':
          if (values.length !== 1) return null;
          return Math.cosh(values[0]);

        case 'tanh':
          if (values.length !== 1) return null;
          return Math.tanh(values[0]);

        case 'log':
          if (values.length !== 1) return null;
          if (values[0] <= 0) return null; // Outside domain
          return Math.log(values[0]);

        case 'ln':
          if (values.length !== 1) return null;
          if (values[0] <= 0) return null; // Outside domain
          return Math.log(values[0]);

        case 'log10':
          if (values.length !== 1) return null;
          if (values[0] <= 0) return null; // Outside domain
          return Math.log10(values[0]);

        case 'exp':
          if (values.length !== 1) return null;
          return Math.exp(values[0]);

        case 'abs':
          if (values.length !== 1) return null;
          return Math.abs(values[0]);

        case 'sqrt':
          if (values.length !== 1) return null;
          if (values[0] < 0) return null; // Outside domain
          return Math.sqrt(values[0]);

        case 'signum':
          if (values.length !== 1) return null;
          return Math.sign(values[0]); // Returns -1, 0, or 1 (integer)

        case 'floor':
          if (values.length !== 1) return null;
          return Math.floor(values[0]); // Returns integer

        case 'ceil':
          if (values.length !== 1) return null;
          return Math.ceil(values[0]); // Returns integer

        case 'round':
          if (values.length !== 1) return null;
          return Math.round(values[0]);

        // Two argument functions
        case 'atan2':
          if (values.length !== 2) return null;
          return Math.atan2(values[0], values[1]);

        case 'pow': {
          if (values.length !== 2) {
            return null;
          }
          const base = values[0];
          const exponent = values[1];
          // Check for invalid cases
          if (base === 0 && exponent <= 0) return null;
          if (base < 0 && !Number.isInteger(exponent)) return null;
          return Math.pow(base, exponent);
        }
        case 'log_base': {
          if (values.length !== 2) {
            return null;
          }
          const value = values[0];
          const base = values[1];
          if (value <= 0 || base <= 0 || base === 1) return null; // Outside domain
          return Math.log(value) / Math.log(base);
        }
        case 'mod':
          if (values.length !== 2) return null;
          if (values[1] === 0) return null; // Division by zero
          return values[0] % values[1];

        case 'max':
          if (values.length < 1) return null;
          return Math.max(...values);

        case 'min':
          if (values.length < 1) return null;
          return Math.min(...values);

        default:
          console.error(`qti-math-operator: unknown operation "${operation}"`);
          return null;
      }
    } catch (error) {
      console.error(`qti-math-operator: error performing operation "${operation}":`, error);
      return null;
    }
  }
}

customElements.define('qti-math-operator', QtiMathOperator);
