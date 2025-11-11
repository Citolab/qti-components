import { QtiConditionExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

// PK: For the contains we assume the expressions to calculate are all directedPairs
// I don't know it this in QTI is always the case however?
export class QtiContains extends QtiConditionExpression {
  public override getResult() {
    // TODO: implement this for other types than directedPair
    const values = this.getVariables() as ResponseVariable[];
    if (this.children.length === 2) {
      const value1 = values[0];
      const value2 = values[1];
      if (
        value1.baseType === 'directedPair' &&
        value2.baseType === 'directedPair' &&
        value1.cardinality === 'multiple'
      ) {
        const projection1 = value1.value as string[];
        const projection2 = value2.value as string[];
        const enumerable = projection1.filter(x => projection2.includes(x));

        const result = enumerable.length > 0;
        return result;
      } else if (
        value1.baseType === 'directedPair' &&
        value2.baseType === 'directedPair' &&
        value1.cardinality === 'single'
      ) {
        const projection1 = value1.value as string;
        const projection2 = value2.value as string[];
        return projection2.includes(projection1);
      } else {
        console.error(
          'unsupported baseType or cardinality in qti contains, only baseType: directedPair and cardinality: multiple is supported'
        );
      }
    } else {
      console.error('unexpected number of children in qti contains');
    }
    return false;
  }
}

customElements.define('qti-contains', QtiContains);
