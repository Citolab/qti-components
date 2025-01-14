import { html } from 'lit';
import { QtiExpression } from '../../../../exports/qti-expression';

export class QtiNot extends QtiExpression<boolean> {
  override render() {
    return html`${super.render()}`;
  }

  public override getResult() {
    const expression = this.firstElementChild as QtiExpression<boolean>;
    const result = expression.calculate() as boolean;
    return !result;
  }
}

customElements.define('qti-not', QtiNot);
