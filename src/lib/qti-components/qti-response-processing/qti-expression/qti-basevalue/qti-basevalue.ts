import { property } from 'lit/decorators.js';
import type { BaseType } from '../../../../exports/expression-result';
import { QtiExpression } from '../../../../exports/qti-expression';
export class QtiBaseValue extends QtiExpression<string> {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType = 'string';

  public override getResult(): string {
    const value = this.textContent.trim();
    return value;
  }
}

customElements.define('qti-base-value', QtiBaseValue);
