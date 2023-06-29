import { ResponseVariable } from '../../../qti-utilities/ResponseVariable';
import { VariableDeclaration } from '../../../qti-utilities/VariableDeclaration';
import { QtiExpression } from '../qti-expression';
export class QtiMultiple extends QtiExpression<ResponseVariable[]> {
  public override calculate(): ResponseVariable[] {
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
    return variables;
  }
}
customElements.define('qti-multiple', QtiMultiple);
