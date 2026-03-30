import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiIntegerToFloat } from './qti-integer-to-float';

describe('qti-integer-to-float', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('converts an integer expression to a numeric float result', () => {
    render(
      html`
        <qti-integer-to-float>
          <qti-base-value base-type="integer">42</qti-base-value>
        </qti-integer-to-float>
      `,
      document.body
    );

    const operator = document.body.querySelector('qti-integer-to-float') as QtiIntegerToFloat;
    expect(operator.calculate()).toBe(42);
  });
});
