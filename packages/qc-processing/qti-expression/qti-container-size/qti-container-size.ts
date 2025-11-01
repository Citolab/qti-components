import { QtiExpression } from '../../../../../src/lib/exports/qti-expression';

import type { ResponseVariable } from '../../../../../src/lib/exports/variables';

/**
 * @summary The qti-container-size operator returns the number of values in a container.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.container-size
 *
 * Takes a sub-expression with any base-type and either multiple or ordered cardinality.
 * Returns an integer giving the number of values in the container.
 * Returns 0 if the sub-expression is NULL.
 */
export class QtiContainerSize extends QtiExpression<number> {
  public override getResult(): number {
    if (this.children?.length !== 1) {
      console.error('qti-container-size must have exactly one child expression');
      return 0;
    }

    const variables = this.getVariables() as ResponseVariable[];

    if (!variables || variables?.length === 0) {
      return 0;
    }

    const variable = variables[0];

    // Handle null values - return 0 as per spec
    if (variable.value === null || variable.value === undefined) {
      return 0;
    }

    // Check cardinality - must be multiple or ordered
    if (variable.cardinality !== 'multiple' && variable.cardinality !== 'ordered') {
      console.error('qti-container-size requires multiple or ordered cardinality');
      return 0;
    }

    // The value should be an array for multiple/ordered cardinality
    if (!Array.isArray(variable.value)) {
      console.error('qti-container-size: expected array value for multiple/ordered cardinality');
      return 0;
    }

    // Return the size of the container
    return variable.value.length;
  }
}

customElements.define('qti-container-size', QtiContainerSize);
