import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-gcd operator calculates the greatest common divisor of integer values.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.gcd
 *
 * Takes 1 or more sub-expressions with base-type integer and any cardinality.
 * Returns a single integer equal to the greatest common divisor of all argument values.
 * Special cases: gcd(0,0)=0, gcd(0,n)=n if n≠0, returns NULL if any argument is NULL or non-numerical.
 */
export class QtiGcd extends QtiExpression<number | null> {
  public override getResult(): number | null {
    if (this.children.length === 0) {
      console.error('qti-gcd must have at least one child expression');
      return null;
    }

    const variables = this.getVariables() as ResponseVariable[];
    if (!variables || variables.length === 0) {
      return null;
    }

    // Collect all integer values from all variables
    const allValues: number[] = [];

    for (const variable of variables) {
      // Check base type
      if (variable.baseType !== 'integer') {
        console.error('qti-gcd requires integer base-type');
        return null;
      }

      // Handle null values
      if (variable.value === null || variable.value === undefined) {
        return null;
      }

      // Handle different cardinalities
      if (variable.cardinality === 'single') {
        if (Array.isArray(variable.value)) {
          console.error('qti-gcd unexpected array value for single cardinality');
          return null;
        }
        const numValue = parseInt(variable.value as string, 10);
        if (isNaN(numValue)) {
          console.error('qti-gcd non-numerical value');
          return null;
        }
        allValues.push(numValue);
      } else if (variable.cardinality === 'multiple' || variable.cardinality === 'ordered') {
        if (!Array.isArray(variable.value)) {
          console.error('qti-gcd expected array value for multiple/ordered cardinality');
          return null;
        }
        for (const value of variable.value) {
          if (value === null || value === undefined) {
            return null;
          }
          const numValue = parseInt(value as string, 10);
          if (isNaN(numValue)) {
            console.error('qti-gcd non-numerical value');
            return null;
          }
          allValues.push(numValue);
        }
      } else {
        console.error('qti-gcd unsupported cardinality');
        return null;
      }
    }

    if (allValues.length === 0) {
      return null;
    }

    // Calculate GCD of all values
    return this.#calculateGcd(allValues);
  }

  /**
   * Calculate the greatest common divisor of an array of integers
   */
  #calculateGcd(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }

    if (values.length === 1) {
      return Math.abs(values[0]);
    }

    // Start with the first value
    let result = Math.abs(values[0]);

    // Calculate GCD with each subsequent value
    for (let i = 1; i < values.length; i++) {
      result = this.#gcdTwoNumbers(result, Math.abs(values[i]));

      // Early termination: if GCD becomes 1, it won't get smaller
      if (result === 1) {
        break;
      }
    }

    return result;
  }

  /**
   * Calculate GCD of two numbers using Euclidean algorithm
   */
  #gcdTwoNumbers(a: number, b: number): number {
    // Handle special cases according to QTI spec
    if (a === 0 && b === 0) {
      return 0; // gcd(0,0) = 0
    }
    if (a === 0) {
      return b; // gcd(0,n) = n
    }
    if (b === 0) {
      return a; // gcd(n,0) = n
    }

    // Euclidean algorithm
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }

    return a;
  }
}

customElements.define('qti-gcd', QtiGcd);
