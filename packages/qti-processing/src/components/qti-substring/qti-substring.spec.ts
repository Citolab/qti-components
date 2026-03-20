import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiSubstring } from './qti-substring';

describe('qti-substring', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns true when the first string occurs in the second string', () => {
    render(
      html`
        <qti-substring>
          <qti-base-value base-type="string">world</qti-base-value>
          <qti-base-value base-type="string">hello world</qti-base-value>
        </qti-substring>
      `,
      document.body
    );

    const operator = document.body.querySelector('qti-substring') as QtiSubstring;
    expect(operator.calculate()).toBe(true);
  });
});
