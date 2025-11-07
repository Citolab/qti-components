import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiRandomInteger } from './qti-random-integer';

describe('qti-random-integer', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  it('should generate values within the specified range', () => {
    const template = () => html` <qti-random-integer min="1" max="10" step="1"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    // Test multiple times to ensure all values are in range
    for (let i = 0; i < 100; i++) {
      const result = qtiRandomInteger.calculate();
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('should respect step parameter (example from spec: min=2, max=11, step=3)', () => {
    const template = () => html` <qti-random-integer min="2" max="11" step="3"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const expectedValues = [2, 5, 8, 11];
    const possibleValues = qtiRandomInteger.getPossibleValues();
    expect(possibleValues).toEqual(expectedValues);

    // Test multiple times to ensure only valid values are generated
    for (let i = 0; i < 100; i++) {
      const result = qtiRandomInteger.calculate();
      expect(expectedValues).toContain(result);
    }
  });

  it('should handle step=1 (consecutive integers)', () => {
    const template = () => html` <qti-random-integer min="5" max="8" step="1"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const expectedValues = [5, 6, 7, 8];
    const possibleValues = qtiRandomInteger.getPossibleValues();
    expect(possibleValues).toEqual(expectedValues);

    for (let i = 0; i < 50; i++) {
      const result = qtiRandomInteger.calculate();
      expect(expectedValues).toContain(result);
    }
  });

  it('should handle step=2 (even spacing)', () => {
    const template = () => html` <qti-random-integer min="0" max="10" step="2"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const expectedValues = [0, 2, 4, 6, 8, 10];
    const possibleValues = qtiRandomInteger.getPossibleValues();
    expect(possibleValues).toEqual(expectedValues);

    for (let i = 0; i < 50; i++) {
      const result = qtiRandomInteger.calculate();
      expect(expectedValues).toContain(result);
    }
  });

  it('should handle single value when min=max', () => {
    const template = () => html` <qti-random-integer min="7" max="7" step="1"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const expectedValues = [7];
    const possibleValues = qtiRandomInteger.getPossibleValues();
    expect(possibleValues).toEqual(expectedValues);

    // Should always return 7
    for (let i = 0; i < 10; i++) {
      const result = qtiRandomInteger.calculate();
      expect(result).toBe(7);
    }
  });

  it('should handle step larger than range', () => {
    const template = () => html` <qti-random-integer min="5" max="7" step="5"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const expectedValues = [5]; // Only min value fits
    const possibleValues = qtiRandomInteger.getPossibleValues();
    expect(possibleValues).toEqual(expectedValues);

    // Should always return 5
    for (let i = 0; i < 10; i++) {
      const result = qtiRandomInteger.calculate();
      expect(result).toBe(5);
    }
  });

  it('should use default values when no attributes specified', () => {
    const template = () => html` <qti-random-integer></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    // Default: min=0, max=10, step=1
    const expectedValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const possibleValues = qtiRandomInteger.getPossibleValues();
    expect(possibleValues).toEqual(expectedValues);

    for (let i = 0; i < 50; i++) {
      const result = qtiRandomInteger.calculate();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(10);
    }
  });

  it('should handle negative numbers', () => {
    const template = () => html` <qti-random-integer min="-5" max="5" step="2"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const expectedValues = [-5, -3, -1, 1, 3, 5];
    const possibleValues = qtiRandomInteger.getPossibleValues();
    expect(possibleValues).toEqual(expectedValues);

    for (let i = 0; i < 50; i++) {
      const result = qtiRandomInteger.calculate();
      expect(expectedValues).toContain(result);
    }
  });

  it('should handle all negative range', () => {
    const template = () => html` <qti-random-integer min="-10" max="-5" step="2"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const expectedValues = [-10, -8, -6];
    const possibleValues = qtiRandomInteger.getPossibleValues();
    expect(possibleValues).toEqual(expectedValues);

    for (let i = 0; i < 50; i++) {
      const result = qtiRandomInteger.calculate();
      expect(expectedValues).toContain(result);
    }
  });

  it('should return min when min > max (error case)', () => {
    const template = () => html` <qti-random-integer min="10" max="5" step="1"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const result = qtiRandomInteger.calculate();
    expect(result).toBe(10); // Should return min when invalid range
  });

  it('should return min when step <= 0 (error case)', () => {
    const template = () => html` <qti-random-integer min="1" max="10" step="0"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const result = qtiRandomInteger.calculate();
    expect(result).toBe(1); // Should return min when invalid step
  });

  it('should handle fractional step values by using integer part', () => {
    const template = () => html` <qti-random-integer min="0" max="10" step="2.7"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    // With step=2.7, should use step=2 (integer part)
    // But since we're dealing with integers, let's see how it behaves
    for (let i = 0; i < 10; i++) {
      const result = qtiRandomInteger.calculate();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('should generate different values over multiple calls (randomness test)', () => {
    const template = () => html` <qti-random-integer min="1" max="100" step="1"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const results = new Set<number>();

    // Generate 50 random values
    for (let i = 0; i < 50; i++) {
      const result = qtiRandomInteger.calculate();
      results.add(result);
    }

    // Should have generated multiple different values (at least 10 different ones)
    expect(results.size).toBeGreaterThanOrEqual(10);
  });

  it('should calculate possible values correctly for edge cases', () => {
    const template = () => html` <qti-random-integer min="1" max="3" step="3"></qti-random-integer> `;
    render(template(), testContainer);
    const qtiRandomInteger = testContainer.querySelector('qti-random-integer') as QtiRandomInteger;

    const possibleValues = qtiRandomInteger.getPossibleValues();
    expect(possibleValues).toEqual([1]); // Only 1 fits (1 + 3*0 = 1, 1 + 3*1 = 4 > max)
  });
});
