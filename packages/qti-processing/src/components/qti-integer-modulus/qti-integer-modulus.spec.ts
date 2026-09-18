import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiIntegerModulus } from './qti-integer-modulus';

describe('qti-integer-modulus', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => testContainer.remove());

  const modulus = (dividend: number, divisor: number) => {
    render(
      html`
        <qti-integer-modulus>
          <qti-base-value base-type="integer">${dividend}</qti-base-value>
          <qti-base-value base-type="integer">${divisor}</qti-base-value>
        </qti-integer-modulus>
      `,
      testContainer
    );
    return (testContainer.querySelector('qti-integer-modulus') as QtiIntegerModulus).calculate();
  };

  it('returns the remainder of integer division', () => {
    expect(modulus(7, 3)).toBe(1);
  });

  // The remainder has to agree with qti-integer-divide, which rounds down.
  it.each([
    [7, 3, 1],
    [-7, 3, 2],
    [7, -3, -2],
    [-7, -3, -1]
  ])('returns the floored remainder of %i modulus %i', (dividend, divisor, expected) => {
    expect(modulus(dividend, divisor)).toBe(expected);
  });

  it('returns null when the divisor is zero', () => {
    expect(modulus(7, 0)).toBeNull();
  });
});
