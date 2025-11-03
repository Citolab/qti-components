import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../../../qti-components';
import { html, render } from 'lit';

import type { QtiMathOperator } from './qti-math-operator';

describe('qti-math-operator', () => {
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

  // Trigonometric functions
  describe('trigonometric functions', () => {
    it('should calculate sin correctly', () => {
      const template = () => html`
        <qti-math-operator name="sin">
          <qti-base-value base-type="float">${Math.PI / 2}</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeCloseTo(1, 10);
    });

    it('should calculate cos correctly', () => {
      const template = () => html`
        <qti-math-operator name="cos">
          <qti-base-value base-type="float">0</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeCloseTo(1, 10);
    });

    it('should calculate tan correctly', () => {
      const template = () => html`
        <qti-math-operator name="tan">
          <qti-base-value base-type="float">${Math.PI / 4}</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeCloseTo(1, 10);
    });
  });

  // Inverse trigonometric functions
  describe('inverse trigonometric functions', () => {
    it('should calculate asin correctly', () => {
      const template = () => html`
        <qti-math-operator name="asin">
          <qti-base-value base-type="float">0.5</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeCloseTo(Math.PI / 6, 10);
    });

    it('should return null for asin outside domain', () => {
      const template = () => html`
        <qti-math-operator name="asin">
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });

    it('should calculate acos correctly', () => {
      const template = () => html`
        <qti-math-operator name="acos">
          <qti-base-value base-type="float">0.5</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeCloseTo(Math.PI / 3, 10);
    });

    it('should return null for acos outside domain', () => {
      const template = () => html`
        <qti-math-operator name="acos">
          <qti-base-value base-type="float">-2</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });

    it('should calculate atan correctly', () => {
      const template = () => html`
        <qti-math-operator name="atan">
          <qti-base-value base-type="float">1</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeCloseTo(Math.PI / 4, 10);
    });
  });

  // Logarithmic functions
  describe('logarithmic functions', () => {
    it('should calculate log (natural log) correctly', () => {
      const template = () => html`
        <qti-math-operator name="log">
          <qti-base-value base-type="float">${Math.E}</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeCloseTo(1, 10);
    });

    it('should return null for log(0)', () => {
      const template = () => html`
        <qti-math-operator name="log">
          <qti-base-value base-type="float">0</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });

    it('should return null for log of negative number', () => {
      const template = () => html`
        <qti-math-operator name="log">
          <qti-base-value base-type="float">-5</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });

    it('should calculate log10 correctly', () => {
      const template = () => html`
        <qti-math-operator name="log10">
          <qti-base-value base-type="float">100</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeCloseTo(2, 10);
    });
  });

  // Exponential and power functions
  describe('exponential and power functions', () => {
    it('should calculate exp correctly', () => {
      const template = () => html`
        <qti-math-operator name="exp">
          <qti-base-value base-type="float">1</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeCloseTo(Math.E, 10);
    });

    it('should calculate sqrt correctly', () => {
      const template = () => html`
        <qti-math-operator name="sqrt">
          <qti-base-value base-type="float">16</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBe(4);
    });

    it('should return null for sqrt of negative number', () => {
      const template = () => html`
        <qti-math-operator name="sqrt">
          <qti-base-value base-type="float">-4</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });
  });

  // Integer-returning functions
  describe('integer-returning functions', () => {
    it('should calculate signum correctly for positive number', () => {
      const template = () => html`
        <qti-math-operator name="signum">
          <qti-base-value base-type="float">5.7</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBe(1);
    });

    it('should calculate signum correctly for negative number', () => {
      const template = () => html`
        <qti-math-operator name="signum">
          <qti-base-value base-type="float">-3.2</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBe(-1);
    });

    it('should calculate signum correctly for zero', () => {
      const template = () => html`
        <qti-math-operator name="signum">
          <qti-base-value base-type="float">0</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBe(0);
    });

    it('should calculate floor correctly', () => {
      const template = () => html`
        <qti-math-operator name="floor">
          <qti-base-value base-type="float">3.7</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBe(3);
    });

    it('should calculate ceil correctly', () => {
      const template = () => html`
        <qti-math-operator name="ceil">
          <qti-base-value base-type="float">3.2</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBe(4);
    });
  });

  // Two-argument functions
  describe('two-argument functions', () => {
    it('should calculate atan2 correctly', () => {
      const template = () => html`
        <qti-math-operator name="atan2">
          <qti-base-value base-type="float">1</qti-base-value>
          <qti-base-value base-type="float">1</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeCloseTo(Math.PI / 4, 10);
    });

    it('should calculate pow correctly', () => {
      const template = () => html`
        <qti-math-operator name="pow">
          <qti-base-value base-type="float">2</qti-base-value>
          <qti-base-value base-type="float">3</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBe(8);
    });

    it('should return null for invalid pow (0^0)', () => {
      const template = () => html`
        <qti-math-operator name="pow">
          <qti-base-value base-type="float">0</qti-base-value>
          <qti-base-value base-type="float">0</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });
  });

  // Multi-argument functions
  describe('multi-argument functions', () => {
    it('should calculate max correctly', () => {
      const template = () => html`
        <qti-math-operator name="max">
          <qti-base-value base-type="float">3</qti-base-value>
          <qti-base-value base-type="float">7</qti-base-value>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBe(7);
    });

    it('should calculate min correctly', () => {
      const template = () => html`
        <qti-math-operator name="min">
          <qti-base-value base-type="float">3</qti-base-value>
          <qti-base-value base-type="float">7</qti-base-value>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBe(2);
    });
  });

  // Error cases
  describe('error cases', () => {
    it('should return null when name attribute is missing', () => {
      const template = () => html`
        <qti-math-operator>
          <qti-base-value base-type="float">5</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });

    it('should return null for unknown operation', () => {
      const template = () => html`
        <qti-math-operator name="unknown">
          <qti-base-value base-type="float">5</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });

    it('should return null when any argument is null', () => {
      const template = () => html`
        <qti-math-operator name="max">
          <qti-base-value base-type="float">5</qti-base-value>
          <qti-base-value base-type="float"></qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });

    it('should return null for non-numerical base-type', () => {
      const template = () => html`
        <qti-math-operator name="abs">
          <qti-base-value base-type="string">not-a-number</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });

    it('should return null for wrong number of arguments', () => {
      const template = () => html`
        <qti-math-operator name="sin">
          <qti-base-value base-type="float">1</qti-base-value>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-math-operator>
      `;
      render(template(), testContainer);
      const qtiMathOp = testContainer.querySelector('qti-math-operator') as QtiMathOperator;
      expect(qtiMathOp.calculate()).toBeNull();
    });
  });
});
