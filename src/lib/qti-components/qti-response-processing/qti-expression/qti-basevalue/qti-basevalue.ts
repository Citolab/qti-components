import { property } from 'lit/decorators.js';
import { BaseType } from '../../../internal/expression-result';
import { QtiExpression } from '../qti-expression';
export class QtiBaseValue extends QtiExpression<string> {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType = 'string';

  public override getResult(): string {
    const value = this.textContent;
    return value;
  }
}

customElements.define('qti-base-value', QtiBaseValue);
