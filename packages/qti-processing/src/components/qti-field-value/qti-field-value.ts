import { inferRecordFieldBaseType, isRecordValue, QtiExpression } from '@qti-components/base';

import type { BaseType, ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-field-value operator retrieves a specific field from a record.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#fieldValue
 *
 * Takes a sub-expression with record cardinality. 'field-identifier' identifies the field.
 * Returns the value of the specified field.
 * Special cases: Returns NULL if sub-expression is NULL or field does not exist.
 */
export class QtiFieldValue extends QtiExpression<string | string[] | null> {
  #fieldBaseType: BaseType | undefined;

  /**
   * The base type of the field last read: as declared on the record's correct response when it
   * is, otherwise read off the value. The value alone is a string like `"4.1"` or `"455 250"`, and
   * an operator reading it as text would refuse to compare it as a number or test it as a point.
   */
  public override get resultBaseType(): BaseType | undefined {
    return this.#fieldBaseType;
  }

  /**
   * Every failure here is NULL rather than a thrown error. `qti-is-null` over a
   * `qti-field-value` is the specified way to ask whether a record carries a
   * field at all, so a missing one has to be an ordinary value — throwing
   * aborted the whole response processing run instead.
   */
  public override getResult() {
    this.#fieldBaseType = undefined;
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

    // A record is declared with cardinality="record" and no base-type; QTI_CONTEXT says both.
    const isRecord = variable?.cardinality === 'record' || variable?.baseType === 'record';
    // A record without a response yet: every field is NULL (not a mistake in the item).
    if (isRecord && (variable.value === null || variable.value === undefined)) return null;
    if (!variable || !isRecord || !isRecordValue(variable.value)) {
      console.warn('qti-field-value child expression must return a record');
      return null;
    }

    const fieldValue = (variable.value as Record<string, any>)[fieldIdentifier];
    if (fieldValue === undefined || fieldValue === null) return null;

    this.#fieldBaseType =
      variable.fieldBaseTypes?.[fieldIdentifier] ??
      inferRecordFieldBaseType(Array.isArray(fieldValue) ? fieldValue[0] : fieldValue);
    return fieldValue;
  }
}
