import { QtiResponseElse } from '../qti-response-else/qti-response-else';

import type { QtiExpression } from '@qti-components/base';
import type { QtiRule } from '../qti-rule/qti-rule';

export class QtiResponseIf extends QtiResponseElse {
  public override calculate() {
    const expression = this.firstElementChild as QtiExpression<boolean>;
    const result = expression.calculate() as boolean;
    return result;
  }

  public override getSubRules(): QtiRule[] {
    const result = [];
    for (let i = 1; i < this.children.length; i++) {
      result.push(this.children[i] as QtiRule);
    }
    return result;
  }
}

customElements.define('qti-response-if', QtiResponseIf);
