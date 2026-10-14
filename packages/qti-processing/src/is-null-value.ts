/**
 * Whether an operand value is NULL in QTI terms, as qti-is-null decides it: no value, or an empty
 * string. An operator that gets a NULL operand yields NULL, which is false in a condition.
 */
export const isNullValue = (value: unknown): boolean => value === null || value === undefined || value === '';
