import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../../../qti-components';
import { html, render } from 'lit';

import type { QtiRound } from './qti-round';

describe('qti-round', () => {
  let testContainer: HTMLElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  it('should round positive numbers correctly', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">6.8</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(7);
  });

  it('should round 6.5 up to 7 (QTI rounding rule)', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">6.5</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(7);
  });

  it('should round 6.49 down to 6', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">6.49</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(6);
  });

  it('should round -6.5 to -6 (towards zero, QTI rule)', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">-6.5</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(-6);
  });

  it('should round -6.8 down to -7', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">-6.8</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(-7);
  });

  it('should round -6.49 to -6', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">-6.49</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(-6);
  });

  it('should handle integer inputs', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="integer">5</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(5);
  });

  it('should handle zero', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">0.0</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(0);
  });

  it('should handle 0.5 rounding to 1', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">0.5</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(1);
  });

  it('should handle -0.5 rounding to 0 (towards zero)', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">-0.5</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(0);
  });

  it('should return null for null input', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float"></qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBeNull();
  });

  it('should return null for NaN input', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">NaN</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBeNull();
  });

  it('should return Infinity for Infinity input', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">Infinity</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(Infinity);
  });

  it('should return -Infinity for -Infinity input', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">-Infinity</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(-Infinity);
  });

  it('should return null when no children provided', () => {
    const template = () => html` <qti-round> </qti-round> `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBeNull();
  });

  it('should return null when multiple children provided', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">6.5</qti-base-value>
        <qti-base-value base-type="float">7.5</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBeNull();
  });

  it('should return null for non-numerical base-type', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="string">not-a-number</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBeNull();
  });

  it('should handle edge case: very small positive number', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">0.1</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(0);
  });

  it('should handle edge case: very small negative number', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">-0.1</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(0);
  });

  it('should handle large numbers', () => {
    const template = () => html`
      <qti-round>
        <qti-base-value base-type="float">999999.7</qti-base-value>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as QtiRound;
    expect(qtiRound.calculate()).toBe(1000000);
  });

  // Test the QTI rounding rule boundary cases more explicitly
  it('should follow QTI rounding rule: n-0.5 boundary cases', () => {
    // Test cases around the boundary [n-0.5, n+0.5)
    const testCases = [
      { input: 6.5, expected: 7 }, // exactly n+0.5, should round up
      { input: 5.5, expected: 6 }, // exactly n+0.5, should round up
      { input: 6.49999, expected: 6 }, // just under n+0.5, should round down
      { input: 5.50001, expected: 6 }, // just over n+0.5, should round up
      { input: -5.5, expected: -5 }, // negative n+0.5, should round towards zero
      { input: -6.5, expected: -6 } // negative n+0.5, should round towards zero
    ];

    testCases.forEach(({ input, expected }) => {
      // Create a fresh container for each test case
      const caseContainer = document.createElement('div');
      document.body.appendChild(caseContainer);

      const template = () => html`
        <qti-round>
          <qti-base-value base-type="float">${input}</qti-base-value>
        </qti-round>
      `;

      render(template(), caseContainer);
      const qtiRound = caseContainer.querySelector('qti-round') as QtiRound;
      expect(qtiRound.calculate()).toBe(expected);

      // Clean up the container
      document.body.removeChild(caseContainer);
    });
  });
});
