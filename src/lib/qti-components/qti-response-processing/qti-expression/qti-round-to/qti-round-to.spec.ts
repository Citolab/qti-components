import '../../../../index';
import { html, render } from 'lit';

import type { QtiRoundTo } from './qti-round-to';

describe('qti-round-to', () => {
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

  describe('decimal places rounding', () => {
    it('should round to 2 decimal places', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="2">
          <qti-base-value base-type="float">3.14159</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(3.14);
    });

    it('should round to 0 decimal places (whole numbers)', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="0">
          <qti-base-value base-type="float">3.7</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(4);
    });

    it('should round up when deciding digit is 5 or greater', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="1">
          <qti-base-value base-type="float">2.75</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(2.8);
    });

    it('should round down when deciding digit is less than 5', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="1">
          <qti-base-value base-type="float">2.74</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(2.7);
    });

    it('should handle negative numbers in decimal places mode', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="2">
          <qti-base-value base-type="float">-3.14159</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(-3.14);
    });
  });

  describe('significant figures rounding', () => {
    it('should round to 3 significant figures', () => {
      const template = () => html`
        <qti-round-to rounding-mode="significantFigures" figures="3">
          <qti-base-value base-type="float">123.456</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(123);
    });

    it('should round to 2 significant figures', () => {
      const template = () => html`
        <qti-round-to rounding-mode="significantFigures" figures="2">
          <qti-base-value base-type="float">123.456</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(120);
    });

    it('should handle numbers less than 1 with significant figures', () => {
      const template = () => html`
        <qti-round-to rounding-mode="significantFigures" figures="2">
          <qti-base-value base-type="float">0.012345</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBeCloseTo(0.012, 10);
    });

    it('should handle very small numbers with significant figures', () => {
      const template = () => html`
        <qti-round-to rounding-mode="significantFigures" figures="3">
          <qti-base-value base-type="float">0.0012345</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBeCloseTo(0.00123, 10);
    });

    it('should handle large numbers with significant figures', () => {
      const template = () => html`
        <qti-round-to rounding-mode="significantFigures" figures="4">
          <qti-base-value base-type="float">123456.789</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(123500);
    });

    it('should round up when deciding digit is 5 or greater (significant figures)', () => {
      const template = () => html`
        <qti-round-to rounding-mode="significantFigures" figures="3">
          <qti-base-value base-type="float">12.56</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(12.6);
    });

    it('should round down when deciding digit is less than 5 (significant figures)', () => {
      const template = () => html`
        <qti-round-to rounding-mode="significantFigures" figures="3">
          <qti-base-value base-type="float">12.54</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(12.5);
    });

    it('should handle negative numbers in significant figures mode', () => {
      const template = () => html`
        <qti-round-to rounding-mode="significantFigures" figures="2">
          <qti-base-value base-type="float">-123.456</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(-120);
    });
  });

  describe('special values and edge cases', () => {
    it('should return null for null input', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="2">
          <qti-base-value base-type="float"></qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBeNull();
    });

    it('should return null for NaN input', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="2">
          <qti-base-value base-type="float">NaN</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBeNull();
    });

    it('should return Infinity for Infinity input', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="2">
          <qti-base-value base-type="float">Infinity</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(Infinity);
    });

    it('should return -Infinity for -Infinity input', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="2">
          <qti-base-value base-type="float">-Infinity</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(-Infinity);
    });

    it('should handle zero correctly', () => {
      const template = () => html`
        <qti-round-to rounding-mode="significantFigures" figures="3">
          <qti-base-value base-type="float">0</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(0);
    });

    it('should use default values when attributes not specified', () => {
      const template = () => html`
        <qti-round-to>
          <qti-base-value base-type="float">123.456789</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      // Default: significantFigures with 3 figures
      expect(qtiRoundTo.calculate()).toBe(123);
    });
  });

  describe('error cases', () => {
    it('should return null when no children provided', () => {
      const template = () => html` <qti-round-to rounding-mode="decimalPlaces" figures="2"> </qti-round-to> `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBeNull();
    });

    it('should return null when multiple children provided', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="2">
          <qti-base-value base-type="float">3.14</qti-base-value>
          <qti-base-value base-type="float">2.71</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBeNull();
    });

    it('should return null for non-numerical base-type', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="2">
          <qti-base-value base-type="string">not-a-number</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBeNull();
    });

    it('should return null for negative figures', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="-1">
          <qti-base-value base-type="float">3.14</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBeNull();
    });

    it('should return null for zero figures in significantFigures mode', () => {
      const template = () => html`
        <qti-round-to rounding-mode="significantFigures" figures="0">
          <qti-base-value base-type="float">3.14</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBeNull();
    });
  });

  describe('precision edge cases', () => {
    it('should handle rounding that affects multiple digits', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="1">
          <qti-base-value base-type="float">1.999</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBe(2.0);
    });

    it('should handle very precise decimal places', () => {
      const template = () => html`
        <qti-round-to rounding-mode="decimalPlaces" figures="5">
          <qti-base-value base-type="float">3.141592653589793</qti-base-value>
        </qti-round-to>
      `;
      render(template(), testContainer);
      const qtiRoundTo = testContainer.querySelector('qti-round-to') as QtiRoundTo;
      expect(qtiRoundTo.calculate()).toBeCloseTo(3.14159, 5);
    });
  });
});
