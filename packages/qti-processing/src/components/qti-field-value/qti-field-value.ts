import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-field-value operator retrieves a specific field from a record.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#fieldValue
 *
 * Takes a sub-expression with record cardinality. 'field-identifier' identifies the field.
 * Returns the value of the specified field.
 * Special cases: Returns NULL if sub-expression is NULL or field does not exist.
 */
export class QtiFieldValue extends QtiExpression<string | string[] | null> {
  /**
   * Every failure here is NULL rather than a thrown error. `qti-is-null` over a
   * `qti-field-value` is the specified way to ask whether a record carries a
   * field at all, so a missing one has to be an ordinary value — throwing
   * aborted the whole response processing run instead.
   */
  public override getResult() {
    const fieldIdentifier = this.getAttribute('field-identifier');

    if (!fieldIdentifier) {
      console.error('qti-field-value requires a field-identifier attribute');
      return null;
    }

    if (this.children.length !== 1) {
      console.error('qti-field-value must have exactly one child expression');
      return null;
    }

    const variable = (this.getVariables() as ResponseVariable[])[0];

    // Check if the result is a record/object
    if (!variable || variable.baseType !== 'record' || variable.value === null || variable.value === undefined) {
      console.warn('qti-field-value child expression must return a record');
      return null;
    }

    const fieldValue = (variable.value as Record<string, any>)[fieldIdentifier];

    return fieldValue === undefined ? null : fieldValue;
  }
}
