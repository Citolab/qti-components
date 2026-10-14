import type { BaseType } from './expression-result';

/**
 * The value of a variable with `record` cardinality: its fields by field identifier.
 *
 * Field values are kept the way every other response value is kept, as QTI string literals — a
 * float is `"4.12"`, a point is `"455 250"` — with a list-valued field as an array of them.
 */
export type RecordValue = Record<string, string | string[] | null>;

/** A record's field values with the base type each `qti-value` declared for its field. */
export interface RecordFieldValues {
  value: RecordValue;
  baseTypes: Record<string, BaseType>;
}

/** Whether a variable value is a record: a plain object, not a list and not NULL. */
export const isRecordValue = (value: unknown): value is RecordValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Reads the field values of a record out of `qti-value field-identifier="…" base-type="…"`
 * elements, as found in a `qti-correct-response` or `qti-default-value` of a record declaration.
 *
 * A value without a `field-identifier` is not a record field and is skipped. A field without a
 * `base-type` gets no entry in `baseTypes`, so a reader can tell "declared string" from "unknown".
 */
export const readRecordFieldValues = (valueElements: Iterable<Element>): RecordFieldValues => {
  const value: RecordValue = {};
  const baseTypes: Record<string, BaseType> = {};
  for (const element of valueElements) {
    const fieldIdentifier = element.getAttribute('field-identifier');
    if (!fieldIdentifier) continue;
    value[fieldIdentifier] = element.textContent?.trim() ?? '';
    const baseType = element.getAttribute('base-type');
    if (baseType) baseTypes[fieldIdentifier] = baseType as BaseType;
  }
  return { value, baseTypes };
};

const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

/**
 * A best guess at a record field's base type, for when the declaration does not say.
 *
 * A record field value carries no type of its own once it is stored, and a record response
 * declaration has no `base-type`, so this is the fallback. A number is a float (or an integer
 * when given as a whole JS number), two numbers separated by whitespace are a point, and
 * anything else is a string.
 */
export const inferRecordFieldBaseType = (value: unknown): BaseType => {
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'float';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value !== 'string') return 'string';
  const text = value.trim();
  if (NUMBER.test(text)) return 'float';
  const parts = text.split(/\s+/);
  if (parts.length === 2 && parts.every(part => NUMBER.test(part))) return 'point';
  return 'string';
};
