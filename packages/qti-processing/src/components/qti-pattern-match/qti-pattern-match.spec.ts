import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiPatternMatch } from './qti-pattern-match';

describe('qti-pattern-match', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => testContainer.remove());

  const match = (pattern: string, value: string) => {
    render(
      html`
        <qti-pattern-match pattern="${pattern}">
          <qti-base-value base-type="string">${value}</qti-base-value>
        </qti-pattern-match>
      `,
      testContainer
    );
    return (testContainer.querySelector('qti-pattern-match') as QtiPatternMatch).calculate();
  };

  it('matches a value against a regular expression pattern', () => {
    expect(match('^[A-Z]{2}\\d{2}$', 'AB12')).toBe(true);
  });

  // XML Schema patterns are implicitly anchored; an unanchored regex would
  // accept any value merely containing a match.
  it('rejects a value the pattern only matches part of', () => {
    expect(match('[0-9]+', 'abc123')).toBe(false);
  });

  it('accepts a value the pattern matches in full', () => {
    expect(match('[0-9]+', '123')).toBe(true);
  });

  it('anchors each branch of a top-level alternation', () => {
    expect(match('cat|dog', 'cat')).toBe(true);
    expect(match('cat|dog', 'dogs')).toBe(false);
  });

  it('supports unicode category escapes', () => {
    expect(match('\\p{L}+', 'oeuvre')).toBe(true);
    expect(match('\\p{L}+', 'oeuvre1')).toBe(false);
  });

  it('returns null for a pattern that is not a valid regular expression', () => {
    expect(match('[unterminated', 'x')).toBeNull();
  });
});
