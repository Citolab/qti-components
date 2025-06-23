import '../../../../index';
import { html, render } from 'lit';

import type { QtiGcd } from './qti.gcd';

describe('qti-gcd', () => {
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

  it('should calculate GCD of two positive integers', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">12</qti-base-value>
        <qti-base-value base-type="integer">8</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(4);
  });

  it('should calculate GCD of multiple integers', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">24</qti-base-value>
        <qti-base-value base-type="integer">36</qti-base-value>
        <qti-base-value base-type="integer">48</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(12);
  });

  it('should handle single value (return absolute value)', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">15</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(15);
  });

  it('should handle negative numbers (use absolute values)', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">-12</qti-base-value>
        <qti-base-value base-type="integer">8</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(4);
  });

  it('should handle both negative numbers', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">-12</qti-base-value>
        <qti-base-value base-type="integer">-8</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(4);
  });

  it('should return 0 when all arguments are zero (gcd(0,0)=0)', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">0</qti-base-value>
        <qti-base-value base-type="integer">0</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(0);
  });

  it('should handle zero with non-zero (gcd(0,n)=n)', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">0</qti-base-value>
        <qti-base-value base-type="integer">15</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(15);
  });

  it('should handle non-zero with zero (gcd(n,0)=n)', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">20</qti-base-value>
        <qti-base-value base-type="integer">0</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(20);
  });

  it('should handle coprime numbers (GCD = 1)', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">7</qti-base-value>
        <qti-base-value base-type="integer">11</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(1);
  });

  it('should handle identical numbers', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">15</qti-base-value>
        <qti-base-value base-type="integer">15</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(15);
  });

  it('should return null for null input', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer"></qti-base-value>
        <qti-base-value base-type="integer">8</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBeNull();
  });

  it('should return null for non-integer base-type', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="float">12.5</qti-base-value>
        <qti-base-value base-type="integer">8</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBeNull();
  });

  it('should return null for non-numerical value', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">not-a-number</qti-base-value>
        <qti-base-value base-type="integer">8</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBeNull();
  });

  it('should return null when no children provided', () => {
    const template = () => html` <qti-gcd> </qti-gcd> `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBeNull();
  });

  it('should handle large numbers', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">1071</qti-base-value>
        <qti-base-value base-type="integer">462</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(21);
  });

  it('should handle many arguments', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">60</qti-base-value>
        <qti-base-value base-type="integer">48</qti-base-value>
        <qti-base-value base-type="integer">36</qti-base-value>
        <qti-base-value base-type="integer">24</qti-base-value>
        <qti-base-value base-type="integer">12</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(12);
  });

  it('should handle mix of zeros and non-zeros', () => {
    const template = () => html`
      <qti-gcd>
        <qti-base-value base-type="integer">0</qti-base-value>
        <qti-base-value base-type="integer">24</qti-base-value>
        <qti-base-value base-type="integer">0</qti-base-value>
        <qti-base-value base-type="integer">36</qti-base-value>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(12);
  });

  // Test with multiple cardinality (if supported by your base-value implementation)
  it('should handle multiple cardinality values', () => {
    // This test assumes your qti-multiple implementation works correctly
    const template = () => html`
      <qti-gcd>
        <qti-multiple>
          <qti-base-value base-type="integer">24</qti-base-value>
          <qti-base-value base-type="integer">36</qti-base-value>
        </qti-multiple>
      </qti-gcd>
    `;
    render(template(), testContainer);
    const qtiGcd = testContainer.querySelector('qti-gcd') as QtiGcd;
    expect(qtiGcd.calculate()).toBe(12);
  });
});
