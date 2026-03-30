import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiTruncate } from './qti-truncate';

describe('qti-truncate', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('truncates towards zero', () => {
    render(
      html`
        <qti-truncate>
          <qti-base-value base-type="float">-6.8</qti-base-value>
        </qti-truncate>
      `,
      document.body
    );

    const operator = document.body.querySelector('qti-truncate') as QtiTruncate;
    expect(operator.calculate()).toBe(-6);
  });
});
