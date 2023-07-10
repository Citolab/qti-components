import { state } from 'lit/decorators.js';
import { QtiExpression } from '../qti-expression';
import { html } from 'lit';
import { ResponseVariable } from '../../../qti-utilities/ResponseVariable';

export class QtiProduct extends QtiExpression<number> {
  public override calculate() {
    const values = this.getVariables() as ResponseVariable[];
    const product = values.reduce((accumulator, currentValue) => {
      if (currentValue.baseType == 'float' || currentValue.baseType == 'integer') {
        try {
          return accumulator * parseInt(currentValue.value.toString());
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
