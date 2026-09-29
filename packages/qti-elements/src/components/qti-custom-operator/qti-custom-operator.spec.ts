import '@citolab/qti-components';

import { html, render } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { registerCustomOperator, unregisterCustomOperator } from '@qti-components/base';

import type { QtiCustomOperator } from './qti-custom-operator';

/**
 * The `definition` mechanism: an operator supplied by the delivery engine,
 * handed the calculated values of the element's children.
 */
describe('qti-custom-operator with a definition', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => testContainer.remove());

  const apply = (definition: string, children: unknown) => {
    render(html`<qti-custom-operator definition="${definition}">${children}</qti-custom-operator>`, testContainer);
    return (testContainer.querySelector('qti-custom-operator') as QtiCustomOperator).calculate();
  };

  const stringValue = (value: string) => html`<qti-base-value base-type="string">${value}</qti-base-value>`;

  describe('built-in operators', () => {
    it('Trim trims the value', () => {
      expect(apply('depcp:Trim', stringValue('  spaced  '))).toBe('spaced');
    });

    it('ToAscii replaces diacritics', () => {
      expect(apply('depcp:ToAscii', stringValue('crème brûlée'))).toBe('creme brulee');
    });

    it('ParseCommaDecimal replaces a decimal comma with a dot', () => {
      expect(apply('depcp:ParseCommaDecimal', stringValue('1,5'))).toBe('1.5');
    });

    it.each(['depcp', 'questify', 'qade'])('is registered under the %s prefix', prefix => {
      expect(apply(`${prefix}:Trim`, stringValue(' x '))).toBe('x');
    });

    it('leaves a null value alone rather than stringifying it', () => {
      expect(apply('depcp:Trim', html`<qti-null></qti-null>`)).toBeNull();
    });
  });

  describe('host-registered operators', () => {
    afterEach(() => {
      unregisterCustomOperator('acme:Shout');
      unregisterCustomOperator('depcp:Trim');
    });

    it('applies an operator the host registered', () => {
      registerCustomOperator('acme:Shout', values => String(values[0]).toUpperCase());
      expect(apply('acme:Shout', stringValue('quiet'))).toBe('QUIET');
    });

    it('receives every child value in document order', () => {
      registerCustomOperator('acme:Shout', values => values.join('-'));
      expect(apply('acme:Shout', html`${stringValue('a')}${stringValue('b')}${stringValue('c')}`)).toBe('a-b-c');
    });

    it('overrides a built-in of the same name', () => {
      registerCustomOperator('depcp:Trim', () => 'overridden');
      expect(apply('depcp:Trim', stringValue('  spaced  '))).toBe('overridden');
    });

    it('restores the built-in once unregistered', () => {
      registerCustomOperator('depcp:Trim', () => 'overridden');
      unregisterCustomOperator('depcp:Trim');
      expect(apply('depcp:Trim', stringValue('  spaced  '))).toBe('spaced');
    });
  });

  it('returns null for a definition nothing provides', () => {
    expect(apply('nobody:Missing', stringValue('x'))).toBeNull();
  });

  it('feeds its result into the surrounding expression', () => {
    render(
      html`
        <qti-match>
          <qti-custom-operator definition="depcp:Trim">
            <qti-base-value base-type="string"> B </qti-base-value>
          </qti-custom-operator>
          <qti-base-value base-type="string">B</qti-base-value>
        </qti-match>
      `,
      testContainer
    );
    expect((testContainer.querySelector('qti-match') as any).calculate()).toBe(true);
  });
});
