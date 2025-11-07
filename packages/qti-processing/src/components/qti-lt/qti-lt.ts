import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

export class QtiLt extends QtiExpression<boolean> {
  public override getResult(): boolean {
    if (this.children.length === 2) {
      const values = this.getVariables() as ResponseVariable[];
      const value1 = values[0];
      const value2 = values[1];
      if (
        (value1.baseType === 'integer' || value1.baseType === 'float') &&
        (value2.baseType === 'integer' || value2.baseType === 'float')
      ) {
        return +value1.value < +value2.value;
      } else {
        console.error('unexpected baseType or cardinality in qti lt');
      }
    }
    console.error('unexpected number of children in lt');
    return null;
  }
}

customElements.define('qti-lt', QtiLt);
