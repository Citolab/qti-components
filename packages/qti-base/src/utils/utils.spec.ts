import { describe, it, expect } from 'vitest';

import { convertNumberToUniversalFormat } from './utils';

describe('convertNumberToUniversalFormat', () => {
  // These ran through `toLocaleString`/`decimalSeparator` before, so what they produced depended on
  // the browser's locale: on a comma-decimal one (nl, de, fr, ...) 0.5 came out as "05".
  it('writes a fraction with a dot, whatever the browser locale is', () => {
    expect(convertNumberToUniversalFormat(0.5)).toBe('0.5');
    expect(convertNumberToUniversalFormat(1.5)).toBe('1.5');
    expect(convertNumberToUniversalFormat(-2.25)).toBe('-2.25');
  });

  it('does not group thousands', () => {
    expect(convertNumberToUniversalFormat(1234)).toBe('1234');
    expect(convertNumberToUniversalFormat(1234.5)).toBe('1234.5');
  });

  it('leaves whole numbers alone', () => {
    expect(convertNumberToUniversalFormat(0)).toBe('0');
    expect(convertNumberToUniversalFormat(3)).toBe('3');
  });

  it('passes strings through untouched', () => {
    expect(convertNumberToUniversalFormat('0.5')).toBe('0.5');
    expect(convertNumberToUniversalFormat('anything')).toBe('anything');
  });
});
