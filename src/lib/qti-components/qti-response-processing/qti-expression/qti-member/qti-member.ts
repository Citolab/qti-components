import { ResponseVariable } from '../../../qti-utilities/Variables';
import { QtiExpression } from '../qti-expression';

export class QtiMember extends QtiExpression<boolean | null> {
  public override calculate() {
    const values = this.getVariables() as ResponseVariable[];

    if (!(this.children.length === 2)) {
      this.error = 'The member operator takes two sub-expressions';
    }

    const [value1, value2] = values;

    if (!(value1.baseType === value2.baseType)) {
      this.error = 'Which must both have the same base-type';
    }
    if (!(value2.cardinality === 'multiple' || value2.cardinality === 'ordered')) {
      this.error = 'and the second must be a multiple or ordered container';
    }
    if (value1.baseType === 'float' || value2.baseType === 'float') {
      this.error = 'The member operator should not be used on sub-expressions with a base-type of float';
    }
    if (value1.baseType === 'duration' || value2.baseType === 'duration') {
      this.error = 'It must not be used on sub-expressions with a base-type of duration';
    }

    // If either sub-expression is NULL then the result of the operator is NULL
    if (value1.value === null || value2.value === null) {
      return null;
    }

    // The result is a single boolean with a value of 'true' if the value given by the first sub-expression is in the container defined by the second sub-expression.
    const projection1 = value1.value as string;
    const projection2 = value2.value as string[];
    return projection2.includes(projection1);
  }
}

customElements.define('qti-member', QtiMember);
