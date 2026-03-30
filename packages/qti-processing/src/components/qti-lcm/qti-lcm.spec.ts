import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiLcm } from './qti-lcm';

describe('qti-lcm', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns the least common multiple for integer values', () => {
    render(
      html`
        <qti-lcm>
          <qti-base-value base-type="integer">4</qti-base-value>
          <qti-base-value base-type="integer">6</qti-base-value>
        </qti-lcm>
      `,
      document.body
    );

    const operator = document.body.querySelector('qti-lcm') as QtiLcm;
    expect(operator.calculate()).toBe(12);
  });
});
