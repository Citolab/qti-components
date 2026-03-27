import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiPatternMatch } from './qti-pattern-match';

describe('qti-pattern-match', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('matches a value against a regular expression pattern', () => {
    render(
      html`
        <qti-pattern-match pattern="^[A-Z]{2}\\d{2}$">
          <qti-base-value base-type="string">AB12</qti-base-value>
        </qti-pattern-match>
      `,
      document.body
    );

    const operator = document.body.querySelector('qti-pattern-match') as QtiPatternMatch;
    expect(operator.calculate()).toBe(true);
  });
});
