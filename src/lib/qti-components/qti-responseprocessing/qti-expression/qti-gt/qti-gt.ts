import { QtiExpression } from '../qti-expression';

export class QtiGt extends QtiExpression<boolean> {
  
  public override calculate(): boolean {
    if (this.children.length === 2) {
      const values = this.getVariables();
      const value1 = values[0];
      const value2 = values[1];
      if (value1.baseType === value2.baseType && (value1.baseType === 'integer' || value1.baseType === 'float')) {
       return  +value1.value > +value2.value;
      } else {
        console.error('unexpected baseType or cardinality in qti gt');
      }
    } 
    console.error('unexpected number of children in qt');
    return null;
  }
}

customElements.define('qti-gt', QtiGt);
