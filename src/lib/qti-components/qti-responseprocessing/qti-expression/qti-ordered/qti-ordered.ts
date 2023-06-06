import { ResponseVariable } from '../../../qti-utilities/ResponseVariable';
import { QtiExpression } from '../qti-expression';
export class QtiOrdered extends QtiExpression<ResponseVariable[]> {
 
  public override calculate(): ResponseVariable[] {
    const variables =   this.getVariables();
    if (variables.length === 0) {
      console.error('unexpected number of children in qti multiple');
      return null;
    }
    for(const variable of variables) {
      if(variable.cardinality !== 'ordered' && variable.cardinality !== 'single') {
        console.error('unexpected cardinality in qti ordered');
        return [];
      }
    }
    return variables;
  }
}

customElements.define('qti-ordered', QtiOrdered);
