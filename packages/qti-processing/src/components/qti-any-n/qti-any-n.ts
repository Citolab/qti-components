import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-any-N operator checks if a specific range of expressions are true.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#anyN
 *
 * Takes 1 or more sub-expressions with base-type boolean and single cardinality.
 * Attributes 'min' and 'max' define the required range of true values.
 * Returns true if true count is within [min, max], false if outside this range.
 * Special cases: Returns NULL if validity cannot be determined due to NULL arguments.
 */
export class QtiAnyN extends QtiExpression<boolean | null> {
  @property({ type: Number }) min = 0;

  @property({ type: Number }) max = Infinity;

  public override getResult(): boolean | null {
    const variables = this.getVariables() as ResponseVariable[];

    if (!variables || variables.length === 0) {
      console.error('qti-any-n requires at least one child expression');
      return null;
    }

    if (this.min < 0 || this.max < this.min) {
      console.error('qti-any-n requires 0 <= min <= max');
      return null;
    }

    let trueCount = 0;
    for (const variable of variables) {
      if (variable.cardinality !== 'single' || Array.isArray(variable.value)) {
        console.error('qti-any-n requires single cardinality boolean expressions');
        return null;
      }
      if (variable.baseType !== 'boolean') {
        console.error('qti-any-n requires boolean base-type');
        return null;
      }
      if (variable.value === null || variable.value === undefined) {
        return null;
      }

      if (variable.value === 'true') {
        trueCount++;
      }
    }

    return trueCount >= this.min && trueCount <= this.max;
  }
}

customElements.define('qti-any-n', QtiAnyN);
