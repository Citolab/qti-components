import { describe, expect, it } from 'vitest';

import { formatVariableValue } from './test-print-item-variables';

describe('formatVariableValue', () => {
  it('prints a record field by field instead of "[object Object]"', () => {
    expect(formatVariableValue({ time: '3.6', point: '455 250' })).toBe('time: 3.6, point: 455 250');
    expect(formatVariableValue({ time: '3.6', point: null })).toBe('time: 3.6, point: ');
    expect(formatVariableValue({ choices: ['A', 'C'] })).toBe('choices: A, C');
  });

  it('prints lists, single values and no value as before', () => {
    expect(formatVariableValue(['A', 'B'])).toBe('A, B');
    expect(formatVariableValue('ChoiceA')).toBe('ChoiceA');
    expect(formatVariableValue(1)).toBe('1');
    expect(formatVariableValue(0)).toBe('0');
    expect(formatVariableValue(null)).toBe('');
    expect(formatVariableValue(undefined)).toBe('');
  });
});
