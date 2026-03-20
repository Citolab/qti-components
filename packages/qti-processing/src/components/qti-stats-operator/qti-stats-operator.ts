import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-stats-operator computes statistics over numerical values.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.stats-operator
 */
export class QtiStatsOperator extends QtiExpression<number | null> {
  @property({ type: String }) name: string = '';

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
        return values.reduce((sum, value) => sum + value, 0) / values.length;
      case 'popsd':
        return this.#populationStandardDeviation(values);
      default:
        console.warn(`qti-stats-operator: unsupported operator "${this.name}"`);
        return null;
    }
  }

  #populationStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
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

customElements.define('qti-stats-operator', QtiStatsOperator);
