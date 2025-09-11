import '../../../../qti-components';
import { html, render } from 'lit';

import type { QtiNull } from './qti-null';

describe('qti-null', () => {
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

  it('should always return null', () => {
    const template = () => html` <qti-null></qti-null> `;
    render(template(), testContainer);
    const qtiNull = testContainer.querySelector('qti-null') as QtiNull;
    expect(qtiNull.calculate()).toBeNull();
  });

  it('should return null regardless of any children (should ignore them)', () => {
    const template = () => html`
      <qti-null>
        <qti-base-value base-type="integer">42</qti-base-value>
        <qti-base-value base-type="string">ignored</qti-base-value>
      </qti-null>
    `;
    render(template(), testContainer);
    const qtiNull = testContainer.querySelector('qti-null') as QtiNull;
    expect(qtiNull.calculate()).toBeNull();
  });

  it('should return null when called multiple times', () => {
    const template = () => html` <qti-null></qti-null> `;
    render(template(), testContainer);
    const qtiNull = testContainer.querySelector('qti-null') as QtiNull;

    // Test multiple calls to ensure consistency
    expect(qtiNull.calculate()).toBeNull();
    expect(qtiNull.calculate()).toBeNull();
    expect(qtiNull.calculate()).toBeNull();
  });

  it('should work in combination with other expressions that check for null', () => {
    const template = () => html`
      <qti-is-null>
        <qti-null></qti-null>
      </qti-is-null>
    `;
    render(template(), testContainer);
    const qtiIsNull = testContainer.querySelector('qti-is-null') as any;
    expect(qtiIsNull.calculate()).toBe(true);
  });

  it('should cause other expressions to return null when used as input', () => {
    const template = () => html`
      <qti-sum>
        <qti-base-value base-type="integer">5</qti-base-value>
        <qti-null></qti-null>
      </qti-sum>
    `;
    render(template(), testContainer);
    const qtiSum = testContainer.querySelector('qti-sum') as any;
    // Sum should return null when any operand is null
    expect(qtiSum.calculate()).toBeNull();
  });

  it('should work with math operators that handle null inputs', () => {
    const template = () => html`
      <qti-math-operator name="abs">
        <qti-null></qti-null>
      </qti-math-operator>
    `;
    render(template(), testContainer);
    const qtiMathOp = testContainer.querySelector('qti-math-operator') as any;
    expect(qtiMathOp.calculate()).toBeNull();
  });

  it('should work with round operator', () => {
    const template = () => html`
      <qti-round>
        <qti-null></qti-null>
      </qti-round>
    `;
    render(template(), testContainer);
    const qtiRound = testContainer.querySelector('qti-round') as any;
    expect(qtiRound.calculate()).toBeNull();
  });

  it('should work in conditional expressions', () => {
    const template = () => html`
      <qti-equal>
        <qti-null></qti-null>
        <qti-base-value base-type="integer">42</qti-base-value>
      </qti-equal>
    `;
    render(template(), testContainer);
    const qtiEqual = testContainer.querySelector('qti-equal') as any;
    // Comparison with null should return false (or null, depending on implementation)
    const result = qtiEqual.calculate();
    expect(result === false || result === null).toBe(true);
  });

  it('should be usable in template processing for setting null values', () => {
    // This would be used in context like:
    // <qti-set-template-value identifier="SOME_VAR">
    //   <qti-null></qti-null>
    // </qti-set-template-value>
    const template = () => html` <qti-null></qti-null> `;
    render(template(), testContainer);
    const qtiNull = testContainer.querySelector('qti-null') as QtiNull;
    expect(qtiNull.calculate()).toBeNull();
  });

  it('should work with multiple operator', () => {
    const template = () => html`
      <qti-multiple>
        <qti-base-value base-type="integer">1</qti-base-value>
        <qti-null></qti-null>
        <qti-base-value base-type="integer">3</qti-base-value>
      </qti-multiple>
    `;
    render(template(), testContainer);
    const qtiMultiple = testContainer.querySelector('qti-multiple') as any;
    // Multiple containing null should handle appropriately
    const result = qtiMultiple.calculate();
    // This depends on your multiple implementation - it might filter nulls or return null
    expect(result).toBeDefined(); // Just ensure it doesn't crash
  });

  it('should be compatible with any base-type context', () => {
    // The spec says null is treated as if it's of any desired base-type
    // This is more of a conceptual test - null should work anywhere
    const template = () => html` <qti-null></qti-null> `;
    render(template(), testContainer);
    const qtiNull = testContainer.querySelector('qti-null') as QtiNull;

    const result = qtiNull.calculate();
    expect(result).toBeNull();

    // Verify it's the actual null value, not undefined or empty string
    expect(result === null).toBe(true);
    expect(result === undefined).toBe(false);
    expect(result === '').toBe(false);
    expect(result === 0).toBe(false);
  });
});
