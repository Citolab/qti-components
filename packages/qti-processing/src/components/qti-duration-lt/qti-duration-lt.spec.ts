import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiDurationLt } from './qti-duration-lt';

describe('qti-duration-lt', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('compares duration expressions', () => {
    render(
      html`
        <qti-duration-lt>
          <qti-base-value base-type="duration">30</qti-base-value>
          <qti-base-value base-type="duration">60</qti-base-value>
        </qti-duration-lt>
      `,
      document.body
    );

    const operator = document.body.querySelector('qti-duration-lt') as QtiDurationLt;
    expect(operator.calculate()).toBe(true);
  });
});
