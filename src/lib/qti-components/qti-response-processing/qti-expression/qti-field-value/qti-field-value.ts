import { QtiExpression } from '../../../../exports/qti-expression';

import type { ResponseVariable } from '../../../../exports/variables';

export class QtiFieldValue extends QtiExpression<string | string[]> {
  public override getResult() {
    const fieldIdentifier = this.getAttribute('field-identifier');

    if (!fieldIdentifier) {
      throw new Error('field-identifier attribute is required');
    }

    // Get the result from the child expression (should be a record)
    const childElements = Array.from(this.children) as QtiExpression<any>[];

    if (childElements.length !== 1) {
      throw new Error('qti-field-value must have exactly one child expression');
    }

    const variable = (this.getVariables() as ResponseVariable[])[0];

    // Check if the result is a record/object
    if (variable.baseType !== 'record' || variable.value === null) {
      throw new Error('qti-field-value child expression must return a record');
    }

    // Return the field value
    const fieldValue = variable.value[fieldIdentifier];

    if (fieldValue === undefined) {
      throw new Error(`Field "${fieldIdentifier}" not found in record`);
    }

    return fieldValue;
  }
}

customElements.define('qti-field-value', QtiFieldValue);
