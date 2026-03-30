import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-is-null operator checks if a variable or expression is missing its value.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#isNull
 *
 * Takes 1 sub-expression with any base-type or cardinality.
 * Returns true if the sub-expression is NULL, false otherwise.
 * Special cases: Empty containers and empty strings are treated as NULL.
 */
export class QtiIsNull extends QtiExpression<boolean> {
  public override getResult(): boolean {
    if (this.children.length === 1) {
      const variables = this.getVariables() as ResponseVariable[];
      if (!variables) {
        return true;
      }
      const value = variables[0].value;
      return value == null || value == undefined || value === '';
    }
    console.error('unexpected number of children in qti Null');
    return null;
  }
}

customElements.define('qti-is-null', QtiIsNull);
