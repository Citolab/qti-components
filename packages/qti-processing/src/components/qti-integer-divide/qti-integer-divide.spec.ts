import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiIntegerDivide } from './qti-integer-divide';

describe('qti-integer-divide', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('divides integers and rounds down', () => {
    render(
      html`
        <qti-integer-divide>
          <qti-base-value base-type="integer">7</qti-base-value>
          <qti-base-value base-type="integer">2</qti-base-value>
        </qti-integer-divide>
      `,
      document.body
    );

    const operator = document.body.querySelector('qti-integer-divide') as QtiIntegerDivide;
    expect(operator.calculate()).toBe(3);
  });
});
