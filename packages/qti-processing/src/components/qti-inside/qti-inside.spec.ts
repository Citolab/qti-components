import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiInside } from './qti-inside';

describe('qti-inside', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns true when a point is inside a circle', () => {
    render(
      html`
        <qti-inside shape="circle" coords="10,10,5">
          <qti-base-value base-type="string">12 12</qti-base-value>
        </qti-inside>
      `,
      document.body
    );

    const operator = document.body.querySelector('qti-inside') as QtiInside;
    expect(operator.calculate()).toBe(true);
  });
});
