import { property } from 'lit/decorators.js';

import { ScoringHelper } from '../../utilities/scoring-helper';
import { QtiExpression } from '../../../../exports/qti-expression';

import type { ResponseVariable } from '../../../../exports/variables';

export class QtiEqual extends QtiExpression<boolean> {
  @property({ type: String }) toleranceMode: 'exact' | 'relative' | 'absolute' = 'exact';

  public override getResult() {
    if (this.children.length === 2) {
      const values = this.getVariables() as ResponseVariable[];
      const value1 = values[0];
      const value2 = values[1];
      if (this.toleranceMode !== 'exact') {
        console.error('toleranceMode is not supported yet');
        return false;
      }
      if (
        value1.cardinality !== 'single' ||
        value2.cardinality !== 'single' ||
        Array.isArray(value1.value) ||
        Array.isArray(value2.value)
      ) {
        console.error('unexpected cardinality in qti equal');
        return false;
      }
      return ScoringHelper.compareSingleValues(value1.value as string, value2.value as string, value1.baseType);
    }
    console.error('unexpected number of children in qti-equal');
    return null;
  }
}

customElements.define('qti-equal', QtiEqual);
