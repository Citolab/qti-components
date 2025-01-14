import type { ResponseVariable } from '../../../../exports/variables';
import { QtiExpression } from '../../../../exports/qti-expression';

export class QtiMember extends QtiExpression<boolean | null> {
  public override getResult() {
    const values = this.getVariables() as ResponseVariable[];

    if (!(this.children.length === 2)) {
      console.warn('The member operator takes two sub-expressions');
    }

    const [value1, value2] = values;

    if (
      !(
        value1.baseType === value2.baseType ||
        (value1.baseType === 'integer' && value2.baseType === 'float') ||
        (value1.baseType === 'float' && value2.baseType === 'integer')
      )
    ) {
      console.warn('Which must both have the same base-type');
    }
    if (!(value2.cardinality === 'multiple' || value2.cardinality === 'ordered')) {
      console.warn('and the second must be a multiple or ordered container');
    }
    if (value1.baseType === 'float' || value2.baseType === 'float') {
      console.warn('The member operator should not be used on sub-expressions with a base-type of float');
    }
    if (value1.baseType === 'duration' || value2.baseType === 'duration') {
      console.warn('It must not be used on sub-expressions with a base-type of duration');
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
