import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiIntegerModulus } from './qti-integer-modulus';

describe('qti-integer-modulus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns the remainder of integer division', () => {
    render(
      html`
        <qti-integer-modulus>
          <qti-base-value base-type="integer">7</qti-base-value>
          <qti-base-value base-type="integer">3</qti-base-value>
        </qti-integer-modulus>
      `,
      document.body
    );

    const operator = document.body.querySelector('qti-integer-modulus') as QtiIntegerModulus;
    expect(operator.calculate()).toBe(1);
  });
});
