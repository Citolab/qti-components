import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-delete operator removes all instances of a value from a container.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#delete
 *
 * Takes a single value (1st) and a container (2nd) of the same base-type.
 * Returns a new container derived from the 2nd with all instances of 1st removed.
 * Special cases: Returns NULL if either argument is NULL.
 */
export class QtiDelete extends QtiExpression<string[] | null> {
  override getResult(): string[] | null {
    if (this.children.length === 2) {
      const values = this.getVariables() as ResponseVariable[];
      const value1 = values[0];
      const value2 = values[1];

      if (value1.cardinality !== 'single' || !Array.isArray(value2.value)) {
        console.error('unexpected cardinality in qti equal');
        return null;
      }

      if (values[0].baseType !== values[1].baseType) {
        console.error('The baseType of the two variables is different');
        return null;
      }

      const filtered = value2.value.filter(v => !value1.value.includes(v));

      return filtered;
    }

    return null;
  }
}

customElements.define('qti-delete', QtiDelete);
