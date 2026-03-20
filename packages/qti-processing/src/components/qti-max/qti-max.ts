import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-max operator finds the largest value in a numerical set.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#max
 *
 * Takes 1 or more numerical sub-expressions of any cardinality.
 * Returns the largest value in the collection.
 * Special cases: Returns NULL if any argument is NULL or non-numerical.
 */
export class QtiMax extends QtiExpression<number | null> {
  public override getResult(): number | null {
    const values = this.#collectNumericValues(this.getVariables() as ResponseVariable[]);
    if (values.length === 0) {
      console.warn('qti-max: no numeric values provided');
      return null;
    }

    return Math.max(...values);
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
          console.warn('qti-max: non-numeric value encountered');
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

customElements.define('qti-max', QtiMax);
