import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiDurationGte } from './qti-duration-gte';

describe('qti-duration-gte', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('compares duration expressions', () => {
    render(
      html`
        <qti-duration-gte>
          <qti-base-value base-type="duration">60</qti-base-value>
          <qti-base-value base-type="duration">30</qti-base-value>
        </qti-duration-gte>
      `,
      document.body
    );

    const operator = document.body.querySelector('qti-duration-gte') as QtiDurationGte;
    expect(operator.calculate()).toBe(true);
  });
});
