import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-min operator returns the minimum value of numerical arguments.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.min
 */
export class QtiMin extends QtiExpression<number | null> {
  public override getResult(): number | null {
    const values = this.#collectNumericValues(this.getVariables() as ResponseVariable[]);
    if (values.length === 0) {
      console.warn('qti-min: no numeric values provided');
      return null;
    }

    return Math.min(...values);
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
          console.warn('qti-min: non-numeric value encountered');
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

customElements.define('qti-min', QtiMin);
