import { QtiExpression } from '../../../../../src/lib/exports/qti-expression';

import type { ResponseVariable } from '../../../../../src/lib/exports/variables';

// PK: For the contains we assume the expressions to calculate are all directedPairs
// I don't know it this in QTI is always the case however?
export class QtiIsNull extends QtiExpression<boolean> {
  public override getResult(): boolean {
    if (this.children.length === 1) {
      const variables = this.getVariables() as ResponseVariable[];
      if (!variables) {
        return true;
      }
      const value = variables[0].value;
      return value == null || value == undefined || value === '';
    }
    console.error('unexpected number of children in qti Null');
    return null;
  }
}

customElements.define('qti-is-null', QtiIsNull);
