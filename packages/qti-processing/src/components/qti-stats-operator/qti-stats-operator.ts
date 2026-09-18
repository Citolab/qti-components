import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';

import type { BaseType, ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-stats-operator performs statistical calculations on a container.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#statsOperator
 *
 * Takes 1 container (multiple/ordered) of numerical base-type.
 * 'name' attribute identifies function (mean, median, popVariance, popSD, sampleVariance, sampleSD).
 * Returns result as a single float.
 * Special cases: Returns NULL if any values in container are NULL or non-numerical.
 */
export class QtiStatsOperator extends QtiExpression<number | null> {
  @property({ type: String }) name: string = '';

  public override get resultBaseType(): BaseType {
    return 'float';
  }

  public override getResult(): number | null {
    if (!this.name) {
      console.warn('qti-stats-operator: missing name attribute');
      return null;
    }

    const values = this.#collectNumericValues(this.getVariables() as ResponseVariable[]);
    if (values.length === 0) {
      console.warn('qti-stats-operator: no numeric values provided');
      return null;
    }

    switch (this.name.toLowerCase()) {
      case 'mean':
        return this.#mean(values);
      case 'median':
        return this.#median(values);
      case 'popvariance':
        return this.#variance(values, values.length);
      case 'popsd':
        return Math.sqrt(this.#variance(values, values.length));
      case 'samplevariance':
        // A sample variance over a single observation has no denominator.
        return values.length < 2 ? null : this.#variance(values, values.length - 1);
      case 'samplesd':
        return values.length < 2 ? null : Math.sqrt(this.#variance(values, values.length - 1));
      default:
        console.warn(`qti-stats-operator: unsupported operator "${this.name}"`);
        return null;
    }
  }

  #mean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  #median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    // An even-sized container has no single middle value, so the two straddling
    // it are averaged.
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
  }

  /** Sum of squared deviations over `denominator` — the population or sample divisor. */
  #variance(values: number[], denominator: number): number {
    const mean = this.#mean(values);
    return values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / denominator;
  }

  #collectNumericValues(variables: ResponseVariable[]): number[] {
    const values: number[] = [];

    for (const variable of variables) {
      if (!variable) {
        continue;
      }

      const pushValue = (raw: unknown) => {
        if (raw === null || raw === undefined) {
          return;
        }
        const numValue = parseFloat(raw.toString());
        if (Number.isNaN(numValue)) {
          console.warn('qti-stats-operator: non-numeric value encountered');
          return;
        }
        values.push(numValue);
      };

      if (Array.isArray(variable.value)) {
        variable.value.forEach(item => pushValue(item));
        continue;
      }

      pushValue(variable.value);
    }

    return values;
  }
}
