import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';
import { ScoringHelper } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-equal operator checks if two numerical expressions are equal.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#equal
 *
 * Takes 2 sub-expressions with numerical base-types and single cardinality.
 * Supports tolerance-mode (exact, absolute, relative) for floating-point comparisons,
 * with 'tolerance', 'include-lower-bound' and 'include-upper-bound'.
 * Returns true if numerically equal within specified tolerance, false otherwise.
 * Special cases: Returns NULL if either sub-expression is NULL.
 */
export class QtiEqual extends QtiExpression<boolean> {
  @property({ type: String, attribute: 'tolerance-mode' }) toleranceMode: 'exact' | 'relative' | 'absolute' = 'exact';

  /** One or two numbers: the lower and upper tolerance. One means both. */
  @property({ type: String }) tolerance: string = '';

  /**
   * Read off the attribute rather than declared as a Lit boolean property: QTI
   * writes `include-lower-bound="false"`, and Lit's boolean converter takes the
   * mere presence of an attribute as true. Both default to true, per the spec.
   */
  get includeLowerBound(): boolean {
    return this.getAttribute('include-lower-bound') !== 'false';
  }

  get includeUpperBound(): boolean {
    return this.getAttribute('include-upper-bound') !== 'false';
  }

  public override getResult() {
    if (this.children.length === 2) {
      const values = this.getVariables() as ResponseVariable[];
      const value1 = values[0];
      const value2 = values[1];

      if (!value1 || !value2) {
        return null;
      }

      if (
        value1.cardinality !== 'single' ||
        value2.cardinality !== 'single' ||
        Array.isArray(value1.value) ||
        Array.isArray(value2.value)
      ) {
        console.error('unexpected cardinality in qti equal');
        return false;
      }

      if (value1.value === null || value2.value === null || value1.value === undefined || value2.value === undefined) {
        return null;
      }

      if (this.toleranceMode === 'exact') {
        return ScoringHelper.compareSingleValues(value1.value as string, value2.value as string, value1.baseType);
      }

      return this.#withinTolerance(parseFloat(value1.value as string), parseFloat(value2.value as string));
    }
    console.error('unexpected number of children in qti-equal');
    return null;
  }

  /**
   * The tolerant comparison: the *second* expression is the reference value and
   * the tolerance is applied around it, so `equal(x, y)` asks whether x falls in
   * y's tolerance band rather than the other way round.
   *
   * `absolute` takes the tolerances as offsets, `relative` as percentages of the
   * reference. A single tolerance is used on both sides.
   */
  #withinTolerance(value: number, reference: number): boolean | null {
    if (Number.isNaN(value) || Number.isNaN(reference)) {
      console.error('qti-equal with a tolerance needs numeric values');
      return null;
    }

    const tolerances = this.tolerance
      .split(/\s+/)
      .filter(Boolean)
      .map(t => parseFloat(t));
    if (tolerances.length === 0 || tolerances.some(t => Number.isNaN(t))) {
      console.error(`qti-equal with tolerance-mode="${this.toleranceMode}" needs a numeric tolerance`);
      return null;
    }

    const [lowerTolerance, upperTolerance = lowerTolerance] = tolerances;

    const [lower, upper] =
      this.toleranceMode === 'absolute'
        ? [reference - lowerTolerance, reference + upperTolerance]
        : [reference * (1 - lowerTolerance / 100), reference * (1 + upperTolerance / 100)];

    return (
      (this.includeLowerBound ? value >= lower : value > lower) &&
      (this.includeUpperBound ? value <= upper : value < upper)
    );
  }
}
