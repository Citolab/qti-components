import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-divide operator divides two numerical values.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.divide
 */
export class QtiDivide extends QtiExpression<number | null> {
  public override getResult(): number | null {
    const values = this.#collectNumericValues(this.getVariables() as ResponseVariable[]);
    if (values.length !== 2) {
      console.warn('qti-divide: expected exactly 2 numeric values');
      return null;
    }

    if (values[1] === 0) {
      console.warn('qti-divide: division by zero');
      return null;
    }

    return values[0] / values[1];
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
          console.warn('qti-divide: non-numeric value encountered');
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

customElements.define('qti-divide', QtiDivide);
