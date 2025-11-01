import { QtiExpression } from '../../../../../src/lib/exports/qti-expression';

import type { ResponseVariable, VariableDeclaration } from '../../../../../src/lib/exports/variables';
export class QtiMultiple extends QtiExpression<VariableDeclaration<string | string[]>[]> {
  public override getResult(): ResponseVariable[] {
    console.debug('qti-multiple getResult called', this.innerHTML);
    const variables = this.getVariables() as ResponseVariable[];

    if (variables.length === 0) {
      console.error('unexpected number of children in qti multiple');
      return null;
    }
    for (const variable of variables) {
      if (variable.cardinality !== 'multiple' && variable.cardinality !== 'single') {
        console.error('unexpected cardinality in qti multiple');
        return [];
      }
    }

    // const values = variables.map(v => v.value);
    // console.log(variables);
    // const flattenedArray = values.reduce((acc: string[], value: string | string[]) => {
    //   return acc.concat(Array.isArray(value) ? [...value] : value);
    // }, []);
    // return flattenedArray;

    return variables;
  }
}

customElements.define('qti-multiple', QtiMultiple);
