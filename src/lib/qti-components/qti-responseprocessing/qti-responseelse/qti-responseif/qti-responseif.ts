import { html } from 'lit';
import { QtiExpression } from '../../qti-expression/qti-expression';
import { QtiRule } from '../../qti-rule/qti-rule';
import { QtiResponseElse } from '../qti-responseelse';

export class QtiResponseIf extends QtiResponseElse {
  override render() {
    return html`${super.render()}`;
  }

  public override calculate() {
    const expression = this.firstElementChild as QtiExpression<boolean>;
    const result = expression.calculate() as boolean;
    return result;
  }

  public override getSubRules(): QtiRule[] {
    const result = [];
    for (let i = 1; i < this.children.length; i++) {
      result.push(this.children[i]);
    }
    return result;
  }
}

customElements.define('qti-response-if', QtiResponseIf);
