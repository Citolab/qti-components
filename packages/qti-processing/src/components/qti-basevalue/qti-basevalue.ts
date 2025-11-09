import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';

import type { BaseType } from '@qti-components/base';

export class QtiBaseValue extends QtiExpression<string> {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType = 'string';

  public override getResult(): string {
    const value = this.textContent.trim();
    return value;
  }
}

customElements.define('qti-base-value', QtiBaseValue);
