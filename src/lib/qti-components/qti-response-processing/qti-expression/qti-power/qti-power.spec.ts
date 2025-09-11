import '../../../../qti-components';
import { html, render } from 'lit';

import type { QtiPower } from './qti-power';

describe('qti-power', () => {
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

  describe('basic power operations', () => {
    it('should calculate positive base with positive exponent', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">2</qti-base-value>
          <qti-base-value base-type="float">3</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(8);
    });

    it('should calculate with integer base types', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="integer">5</qti-base-value>
          <qti-base-value base-type="integer">2</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(25);
    });

    it('should calculate with mixed integer and float types', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="integer">3</qti-base-value>
          <qti-base-value base-type="float">2.5</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeCloseTo(15.588, 3);
    });

    it('should handle fractional exponents', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">9</qti-base-value>
          <qti-base-value base-type="float">0.5</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(3); // 9^0.5 = sqrt(9) = 3
    });

    it('should handle negative exponents', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">2</qti-base-value>
          <qti-base-value base-type="float">-3</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(0.125); // 2^(-3) = 1/8 = 0.125
    });
  });

  describe('special cases', () => {
    it('should handle exponent of 0 (any number to power 0 equals 1)', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">42</qti-base-value>
          <qti-base-value base-type="float">0</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(1);
    });

    it('should handle base of 1 (1 to any power equals 1)', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">1</qti-base-value>
          <qti-base-value base-type="float">999</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(1);
    });

    it('should handle exponent of 1 (any number to power 1 equals itself)', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">7.5</qti-base-value>
          <qti-base-value base-type="float">1</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(7.5);
    });

    it('should return null for 0^0 (undefined)', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">0</qti-base-value>
          <qti-base-value base-type="float">0</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull();
    });

    it('should return null for 0^(-n) (undefined)', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">0</qti-base-value>
          <qti-base-value base-type="float">-2</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull();
    });

    it('should return null for negative base with non-integer exponent', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">-4</qti-base-value>
          <qti-base-value base-type="float">0.5</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull(); // Would result in complex number
    });

    it('should handle negative base with integer exponent', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">-2</qti-base-value>
          <qti-base-value base-type="integer">3</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(-8); // (-2)^3 = -8
    });

    it('should handle negative base with even integer exponent', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">-3</qti-base-value>
          <qti-base-value base-type="integer">2</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(9); // (-3)^2 = 9
    });
  });

  describe('infinity cases', () => {
    it('should return Infinity for large results', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">10</qti-base-value>
          <qti-base-value base-type="float">1000</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(Infinity);
    });

    it('should return 0 for very small positive results', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">10</qti-base-value>
          <qti-base-value base-type="float">-1000</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(0);
    });
  });

  describe('null handling', () => {
    it('should return null when base is null', () => {
      const template = () => html`
        <qti-power>
          <qti-null></qti-null>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull();
    });

    it('should return null when exponent is null', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">2</qti-base-value>
          <qti-null></qti-null>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull();
    });

    it('should return null when both expressions are null', () => {
      const template = () => html`
        <qti-power>
          <qti-null></qti-null>
          <qti-null></qti-null>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull();
    });
  });

  describe('error cases', () => {
    it('should return null when wrong number of arguments', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull();
    });

    it('should return null when too many arguments', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">2</qti-base-value>
          <qti-base-value base-type="float">3</qti-base-value>
          <qti-base-value base-type="float">4</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull();
    });

    it('should return null for non-numerical base type', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="string">not-a-number</qti-base-value>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull();
    });

    it('should return null for non-numerical exponent type', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">2</qti-base-value>
          <qti-base-value base-type="string">not-a-number</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull();
    });

    it('should return null for non-single cardinality', () => {
      const template = () => html`
        <qti-power>
          <qti-multiple>
            <qti-base-value base-type="float">2</qti-base-value>
            <qti-base-value base-type="float">3</qti-base-value>
          </qti-multiple>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeNull();
    });
  });

  describe('precision and edge cases', () => {
    it('should handle very small bases', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">0.1</qti-base-value>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(0.01);
    });

    it('should handle decimal results correctly', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">2.5</qti-base-value>
          <qti-base-value base-type="float">2</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBe(6.25);
    });

    it('should handle cube root (1/3 exponent)', () => {
      const template = () => html`
        <qti-power>
          <qti-base-value base-type="float">8</qti-base-value>
          <qti-base-value base-type="float">0.333333333</qti-base-value>
        </qti-power>
      `;
      render(template(), testContainer);
      const qtiPower = testContainer.querySelector('qti-power') as QtiPower;
      expect(qtiPower.calculate()).toBeCloseTo(2, 1); // 8^(1/3) ≈ 2
    });
  });
});
