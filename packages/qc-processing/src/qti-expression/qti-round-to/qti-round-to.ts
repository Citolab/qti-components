import { property } from 'lit/decorators.js';
import { QtiExpression } from '@qti-components/shared';

import type { ResponseVariable } from '@qti-components/shared';

/**
 * @summary The qti-round-to operator rounds a numerical value to specified precision.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.round-to
 *
 * Takes one sub-expression with single cardinality and numerical base-type.
 * Returns a single float rounded by the specified method to the specified precision.
 * Supports rounding to decimal places or significant figures.
 */
export class QtiRoundTo extends QtiExpression<number | null> {
  @property({ type: String, attribute: 'rounding-mode' })
  roundingMode: 'decimalPlaces' | 'significantFigures' = 'significantFigures';

  @property({ type: Number })
  figures: number = 3;

  public override getResult(): number | null {
    if (this.children.length !== 1) {
      console.error('qti-round-to must have exactly one child expression');
      return null;
    }

    const variables = this.getVariables() as ResponseVariable[];
    if (!variables || variables.length === 0) {
      return null;
    }

    const variable = variables[0];

    // Check cardinality
    if (variable.cardinality !== 'single') {
      console.error('qti-round-to requires single cardinality');
      return null;
    }

    // Check if value is array (shouldn't be for single cardinality)
    if (Array.isArray(variable.value)) {
      console.error('qti-round-to unexpected array value for single cardinality');
      return null;
    }

    // Handle null values
    if (variable.value === null || variable.value === undefined) {
      return null;
    }

    // Check base type
    if (variable.baseType !== 'integer' && variable.baseType !== 'float') {
      console.error('qti-round-to requires numerical base-type');
      return null;
    }

    // Convert to number
    const numericValue = parseFloat(variable.value as string);

    // Handle special cases
    if (isNaN(numericValue)) {
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

    // Validate figures
    if (this.figures < 0) {
      console.error('qti-round-to: figures must be non-negative');
      return null;
    }

    if (this.roundingMode === 'significantFigures' && this.figures < 1) {
      console.error('qti-round-to: figures must be at least 1 for significantFigures mode');
      return null;
    }

    // Perform rounding
    if (this.roundingMode === 'decimalPlaces') {
      return this._roundToDecimalPlaces(numericValue, this.figures);
    } else {
      return this._roundToSignificantFigures(numericValue, this.figures);
    }
  }

  /**
   * Round to specified number of decimal places
   */
  private _roundToDecimalPlaces(value: number, decimalPlaces: number): number {
    if (value === 0) {
      return 0;
    }

    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Round to specified number of significant figures
   */
  private _roundToSignificantFigures(value: number, significantFigures: number): number {
    if (value === 0) {
      return 0;
    }

    // Find the order of magnitude of the first non-zero digit
    const magnitude = Math.floor(Math.log10(Math.abs(value)));

    // Calculate the multiplier to shift the decimal point
    const multiplier = Math.pow(10, significantFigures - magnitude - 1);

    // Round and shift back
    return Math.round(value * multiplier) / multiplier;
  }
}

customElements.define('qti-round-to', QtiRoundTo);
