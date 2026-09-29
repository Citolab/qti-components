import '@citolab/qti-components';

import { html, render } from 'lit';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiEqual } from './qti-equal';

describe('qti-equal', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    testContainer.remove();
  });

  it('response and correct response match', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="string" cardinality="single">
          <qti-correct-response>
            <qti-value>test</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal tolerance-mode="exact">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal>
      </qti-assessment-item>
    `;
    render(template(), testContainer);

    const qtiEqual = testContainer.querySelector('qti-equal') as QtiEqual;
    const assessmentItem = testContainer.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', 'test');

    expect(qtiEqual.calculate()).toBeTruthy();
  });

  it('response and correct response do not match', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="string" cardinality="single">
          <qti-correct-response>
            <qti-value>correct</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal tolerance-mode="exact">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal>
      </qti-assessment-item>
    `;
    render(template(), testContainer);

    const qtiEqual = testContainer.querySelector('qti-equal') as QtiEqual;
    const assessmentItem = testContainer.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('RESPONSE', 'test');

    expect(qtiEqual.calculate()).toBeFalsy();
  });

  it('returns null for unanswered numeric responses without conversion errors', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="RESPONSE" base-type="integer" cardinality="single">
          <qti-correct-response>
            <qti-value>42</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-equal tolerance-mode="exact">
          <qti-variable identifier="RESPONSE"></qti-variable>
          <qti-correct identifier="RESPONSE"></qti-correct>
        </qti-equal>
      </qti-assessment-item>
    `;
    render(template(), testContainer);

    const qtiEqual = testContainer.querySelector('qti-equal') as QtiEqual;

    expect(qtiEqual.calculate()).toBeNull();
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(expect.stringContaining('Cannot convert'));

    consoleErrorSpy.mockRestore();
  });
  // tolerance-mode absolute / relative, which used to log "not supported yet"
  // and return false regardless of the values.
  describe('tolerance', () => {
    const compare = (attributes: Record<string, string>, value: number, reference: number) => {
      render(
        html`
          <qti-equal>
            <qti-base-value base-type="float">${value}</qti-base-value>
            <qti-base-value base-type="float">${reference}</qti-base-value>
          </qti-equal>
        `,
        testContainer
      );
      const equal = testContainer.querySelector('qti-equal') as QtiEqual;
      for (const [name, attributeValue] of Object.entries(attributes)) {
        equal.setAttribute(name, attributeValue);
      }
      return equal.calculate();
    };

    const absolute = (tolerance: string, extra: Record<string, string> = {}) => ({
      'tolerance-mode': 'absolute',
      tolerance,
      ...extra
    });

    it('accepts a value inside an absolute tolerance', () => {
      expect(compare(absolute('0.5'), 10.4, 10)).toBe(true);
    });

    it('rejects a value outside an absolute tolerance', () => {
      expect(compare(absolute('0.5'), 10.6, 10)).toBe(false);
    });

    it('accepts a value inside a relative tolerance', () => {
      // 10% of 200 is 20, so 215 is inside.
      expect(compare({ 'tolerance-mode': 'relative', tolerance: '10' }, 215, 200)).toBe(true);
    });

    it('rejects a value outside a relative tolerance', () => {
      expect(compare({ 'tolerance-mode': 'relative', tolerance: '10' }, 225, 200)).toBe(false);
    });

    it('applies an asymmetric tolerance to the matching side', () => {
      expect(compare(absolute('1 3'), 9.5, 10)).toBe(true);
      expect(compare(absolute('1 3'), 8.5, 10)).toBe(false);
      expect(compare(absolute('1 3'), 12.5, 10)).toBe(true);
      expect(compare(absolute('1 3'), 13.5, 10)).toBe(false);
    });

    it('includes both bounds by default', () => {
      expect(compare(absolute('1'), 9, 10)).toBe(true);
      expect(compare(absolute('1'), 11, 10)).toBe(true);
    });

    it('excludes a bound when told to', () => {
      expect(compare(absolute('1', { 'include-lower-bound': 'false' }), 9, 10)).toBe(false);
      expect(compare(absolute('1', { 'include-upper-bound': 'false' }), 11, 10)).toBe(false);
    });

    it('returns null when a tolerance mode carries no tolerance', () => {
      expect(compare({ 'tolerance-mode': 'absolute' }, 10, 10)).toBeNull();
    });
  });
});
