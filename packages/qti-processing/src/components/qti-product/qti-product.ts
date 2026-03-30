import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-product operator calculates the product of multiple numerical values.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#product
 *
 * Takes 1 or more sub-expressions with numerical base-types and any cardinality.
 * Returns a single float (or integer if all arguments are integers).
 * Special cases: Returns NULL if any sub-expression is NULL.
 */
export class QtiProduct extends QtiExpression<number> {
  public override getResult() {
    const values = this.getVariables() as ResponseVariable[];
    const product = values.reduce((accumulator, currentValue) => {
      if (currentValue.baseType == 'float' || currentValue.baseType == 'integer') {
        try {
          return accumulator * parseFloat(currentValue.value.toString());
        } catch (error) {
          console.warn(`can not convert to number`);
        }
      } else {
        console.warn(`has another baseType ${currentValue.baseType}`);
      }
      return accumulator;
    }, 1);
    return product;
  }
}

customElements.define('qti-product', QtiProduct);
