import { inferRecordFieldBaseType, isRecordValue } from '@qti-components/base';

import { dataUrlToFile, fileToDataUrl, isFileBaseType, isQtiFileData } from './file-response';

import type { BaseType, RecordValue } from '@qti-components/base';
import type { QtiBaseTypeJSON, QtiListTypeJSON, QtiRecordItem, QtiVariableJSON } from './interface';

/**
 * Conversions between a record response as the item stores it and the QTI Appendix C JSON a PCI
 * speaks.
 *
 * The item stores a record as a field map of QTI string literals, the same way it stores every
 * other response value: `{ time: '4.12', point: '455 250' }`. A PCI hands back and receives
 * `{ record: [{ name: 'time', base: { float: 4.12 } }, { name: 'point', base: { point: [455, 250] } }] }`.
 */

/** Base types whose Appendix C value is a two-element array, stored as `"a b"`. */
const PAIR_BASE_TYPES = new Set<string>(['point', 'pair', 'directedPair']);

/**
 * Coerce a scalar value to the expected base-type when possible
 */
export const coerceBaseValue = (value: unknown, baseType: BaseType): unknown => {
  if (value === null || value === undefined) return value;
  if (isFileBaseType(baseType)) return dataUrlToFile(value);

  switch (baseType) {
    case 'integer': {
      if (typeof value === 'number') return value;
      const parsed = parseInt(String(value), 10);
      return Number.isNaN(parsed) ? value : parsed;
    }
    case 'float':
    case 'duration': {
      if (typeof value === 'number') return value;
      const parsed = parseFloat(String(value));
      return Number.isNaN(parsed) ? value : parsed;
    }
    case 'boolean': {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lowered = value.toLowerCase();
        if (lowered === 'true') return true;
        if (lowered === 'false') return false;
      }
      return value;
    }
    case 'point': {
      const parts = Array.isArray(value)
        ? value
        : String(value)
            .trim()
            .split(/[\s,]+/);
      const numbers = parts.map(part => (typeof part === 'number' ? part : parseFloat(String(part))));
      return numbers.length === 2 && numbers.every(Number.isFinite) ? numbers : value;
    }
    case 'pair':
    case 'directedPair': {
      const parts = Array.isArray(value) ? value : String(value).trim().split(/\s+/);
      return parts.length === 2 ? parts.map(String) : value;
    }
    case 'string':
    case 'identifier':
    default:
      return String(value);
  }
};

/**
 * Build a record entry from an arbitrary value.
 *
 * With a `baseType` the value is coerced to it, which is how a stored record (all strings) goes
 * out with its declared field types. Without one the type is read off the JS value, which suits
 * values that are typed already, like the QTI_CONTEXT defaults.
 */
export const recordEntryFromValue = (name: string, entryValue: unknown, baseType?: BaseType): QtiRecordItem => {
  if (baseType) {
    if (Array.isArray(entryValue) && !PAIR_BASE_TYPES.has(baseType)) {
      return { name, list: { [baseType]: entryValue.map(v => coerceBaseValue(v, baseType)) } as QtiListTypeJSON };
    }
    if (entryValue === null || entryValue === undefined) {
      return { name, base: null };
    }
    return { name, base: { [baseType]: coerceBaseValue(entryValue, baseType) } as QtiBaseTypeJSON };
  }

  if (Array.isArray(entryValue)) {
    const filtered = entryValue.filter(v => v !== null && v !== undefined);

    if (filtered.length && filtered.every(v => typeof v === 'boolean')) {
      return { name, list: { boolean: filtered as boolean[] } };
    }

    if (filtered.length && filtered.every(v => typeof v === 'number')) {
      const numbers = filtered as number[];
      const isIntegers = numbers.every(n => Number.isInteger(n));
      return { name, list: { [isIntegers ? 'integer' : 'float']: numbers } };
    }

    return { name, list: { string: entryValue.map(v => (v === null || v === undefined ? '' : String(v))) } };
  }

  if (typeof entryValue === 'boolean') {
    return { name, base: { boolean: entryValue } };
  }

  if (typeof entryValue === 'number') {
    if (Number.isInteger(entryValue)) return { name, base: { integer: entryValue } };
    return { name, base: { float: entryValue } };
  }

  if (entryValue === null || entryValue === undefined) {
    return { name, base: { string: '' } };
  }

  if (typeof entryValue === 'object') {
    try {
      return { name, base: { string: JSON.stringify(entryValue) } };
    } catch {
      return { name, base: { string: String(entryValue) } };
    }
  }

  return { name, base: { string: String(entryValue) } };
};

/**
 * Convert a record object into QtiVariableJSON.
 *
 * `fieldBaseTypes` gives the base type per field; fields it does not name are typed by their JS
 * value (see {@link recordEntryFromValue}).
 */
export const recordToQtiVariableJSON = (
  value: unknown,
  fieldBaseTypes: Record<string, BaseType> = {}
): QtiVariableJSON => {
  if (!isRecordValue(value)) {
    return { record: [] };
  }

  const recordEntries: QtiRecordItem[] = [];
  for (const [name, entryValue] of Object.entries(value as Record<string, unknown>)) {
    recordEntries.push(recordEntryFromValue(name, entryValue, fieldBaseTypes[name]));
  }

  return { record: recordEntries };
};

/**
 * The base type of every field of a stored record response: as declared where the declaration
 * says, and otherwise read off the stored string (`"4.1"` is a float, `"455 250"` a point).
 */
export const recordFieldBaseTypes = (
  value: unknown,
  declared: Record<string, BaseType> = {}
): Record<string, BaseType> => {
  if (!isRecordValue(value)) return { ...declared };
  const baseTypes: Record<string, BaseType> = {};
  for (const [name, entryValue] of Object.entries(value)) {
    baseTypes[name] =
      declared[name] ?? inferRecordFieldBaseType(Array.isArray(entryValue) ? entryValue[0] : entryValue);
  }
  return baseTypes;
};

/** A stored record response as the Appendix C JSON a PCI receives in `boundTo`. */
export const recordResponseToQtiVariableJSON = (
  value: unknown,
  declared: Record<string, BaseType> = {}
): QtiVariableJSON => recordToQtiVariableJSON(value, recordFieldBaseTypes(value, declared));

/** One Appendix C scalar as the QTI string literal the item stores. */
const toQtiLiteral = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map(String).join(' ');
  if (isQtiFileData(value)) return fileToDataUrl(value); // stored as the data URL an upload stores
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

/** The one value of an Appendix C `base` or `list` object, whatever its base-type key is. */
const firstTypedValue = <T>(typed: Record<string, T> | null | undefined): T | undefined => {
  if (!typed) return undefined;
  for (const key of Object.keys(typed)) {
    const value = typed[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
};

/**
 * Appendix C `record` entries as the field map the item stores.
 *
 * Every value becomes its QTI string literal: `{ float: 4.12 }` is `"4.12"`, `{ point: [455, 250] }`
 * is `"455 250"`, and a `list` field becomes an array of them. A field with a NULL value is kept as
 * `null`, so `qti-is-null` over `qti-field-value` sees it.
 */
export const recordFromQtiVariableJSON = (record: readonly QtiRecordItem[]): RecordValue => {
  const value: RecordValue = {};
  for (const entry of record) {
    if (!entry || typeof entry.name !== 'string' || !entry.name) continue;
    if (entry.list) {
      const items = firstTypedValue(entry.list as Record<string, unknown[]>);
      value[entry.name] = Array.isArray(items) ? items.map(toQtiLiteral).filter((v): v is string => v !== null) : [];
    } else {
      value[entry.name] = toQtiLiteral(firstTypedValue(entry.base as Record<string, unknown>));
    }
  }
  return value;
};
