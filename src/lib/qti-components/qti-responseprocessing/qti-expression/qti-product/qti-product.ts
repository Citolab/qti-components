import { state } from 'lit/decorators.js';
import { QtiExpression } from '../qti-expression';
import { html } from 'lit';

export class QtiProduct extends QtiExpression<number> {
  @state()
  mult: number = 0;

  override render = () => html`<pre>${this.mult}</pre>`;

  public override calculate() {
    const values = this.getVariables();
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
    this.mult = product;
    return product;
  }
}

customElements.define('qti-product', QtiProduct);
