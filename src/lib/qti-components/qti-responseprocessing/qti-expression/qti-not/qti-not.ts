import { LitElement, html } from 'lit';
import { QtiExpression } from '../qti-expression';
import { QtiRule } from '../../qti-rule/qti-rule';
import { ResponseVariable } from '../../../qti-utilities/ResponseVariable';

export class QtiNot extends QtiExpression<boolean> {
  override render() {
    return html`${super.render()}`;
  }

  public override calculate() {
    const expression = this.firstElementChild as QtiExpression<boolean>;
    const result = expression.calculate() as boolean;
    return !result;
  }
}

customElements.define('qti-not', QtiNot);
