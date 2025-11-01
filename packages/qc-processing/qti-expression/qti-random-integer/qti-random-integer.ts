import { property } from 'lit/decorators.js';

import { QtiExpression } from '../../../../../src/lib/exports/qti-expression';

/**
 * @summary The qti-random-integer operator selects a random integer from a specified range.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.random-integer
 *
 * Selects a random integer from the range [min,max] satisfying min + step * n for some integer n.
 * For example, with min=2, max=11 and step=3 the values {2,5,8,11} are possible.
 */
export class QtiRandomInteger extends QtiExpression<number> {
  @property({ type: Number }) min: number = 0;
  @property({ type: Number }) max: number = 10;
  @property({ type: Number }) step: number = 1;

  public override getResult(): number {
    // Validate attributes
    if (this.min > this.max) {
      console.error('qti-random-integer: min cannot be greater than max');
      return this.min;
    }

    if (this.step <= 0) {
      console.error('qti-random-integer: step must be positive');
      return this.min;
    }

    // Calculate all possible values in the range
    const possibleValues: number[] = [];

    // Generate values using the formula: min + step * n for integer n
    let n = 0;
    while (true) {
      const value = this.min + this.step * n;
      if (value > this.max) {
        break;
      }
      // Only add integer values
      if (Number.isInteger(value)) {
        possibleValues.push(value);
      }
      n++;
    }

    // If no valid integer values found, return min (if it's an integer) or floor(min)
    if (possibleValues.length === 0) {
      console.warn('qti-random-integer: no valid integer values in range');
      return Number.isInteger(this.min) ? this.min : Math.floor(this.min);
    }

    // Select a random value from the possible values
    const randomIndex = Math.floor(Math.random() * possibleValues.length);
    return possibleValues[randomIndex];
  }

  /**
   * Get all possible values for testing purposes
   */
  public getPossibleValues(): number[] {
    const possibleValues: number[] = [];

    if (this.min > this.max || this.step <= 0) {
      return [Number.isInteger(this.min) ? this.min : Math.floor(this.min)];
    }

    let n = 0;
    while (true) {
      const value = this.min + this.step * n;
      if (value > this.max) {
        break;
      }
      // Only add integer values
      if (Number.isInteger(value)) {
        possibleValues.push(value);
      }
      n++;
    }

    return possibleValues.length > 0 ? possibleValues : [Number.isInteger(this.min) ? this.min : Math.floor(this.min)];
  }
}

customElements.define('qti-random-integer', QtiRandomInteger);
