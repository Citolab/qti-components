import { QtiExpression } from '../../../../exports/qti-expression';

import type { ResponseVariable } from '../../../../exports/variables';

export class QtiDelete extends QtiExpression<string[] | null> {
  override getResult(): string[] | null {
    if (this.children.length === 2) {
      const values = this.getVariables() as ResponseVariable[];
      const value1 = values[0];
      const value2 = values[1];

      if (value1.cardinality !== 'single' || !Array.isArray(value2.value)) {
        console.error('unexpected cardinality in qti equal');
        return null;
      }

      if (values[0].baseType !== values[1].baseType) {
        console.error('The baseType of the two variables is different');
        return null;
      }

      const filtered = value2.value.filter(v => !value1.value.includes(v));

      return filtered;
    }
  }
}

customElements.define('qti-delete', QtiDelete);
