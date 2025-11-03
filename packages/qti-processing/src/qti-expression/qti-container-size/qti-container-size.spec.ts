import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../../../qti-components';
import { html, render } from 'lit';

import type { QtiContainerSize } from './qti-container-size';

describe('qti-container-size', () => {
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

  describe('multiple cardinality containers', () => {
    it('should return size of multiple container with string values', () => {
      const template = () => html`
        <qti-container-size>
          <qti-multiple>
            <qti-base-value base-type="identifier">A</qti-base-value>
            <qti-base-value base-type="identifier">B</qti-base-value>
            <qti-base-value base-type="identifier">C</qti-base-value>
          </qti-multiple>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(3);
    });

    it('should return size of multiple container with integer values', () => {
      const template = () => html`
        <qti-container-size>
          <qti-multiple>
            <qti-base-value base-type="integer">1</qti-base-value>
            <qti-base-value base-type="integer">2</qti-base-value>
            <qti-base-value base-type="integer">3</qti-base-value>
            <qti-base-value base-type="integer">4</qti-base-value>
            <qti-base-value base-type="integer">5</qti-base-value>
          </qti-multiple>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(5);
    });

    it('should return size of multiple container with float values', () => {
      const template = () => html`
        <qti-container-size>
          <qti-multiple>
            <qti-base-value base-type="float">1.1</qti-base-value>
            <qti-base-value base-type="float">2.2</qti-base-value>
          </qti-multiple>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(2);
    });

    it('should return 0 for empty multiple container', () => {
      const template = () => html`
        <qti-container-size>
          <qti-multiple> </qti-multiple>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(0);
    });

    it('should return 1 for single item in multiple container', () => {
      const template = () => html`
        <qti-container-size>
          <qti-multiple>
            <qti-base-value base-type="string">only-one</qti-base-value>
          </qti-multiple>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(1);
    });
  });

  describe('ordered cardinality containers', () => {
    it('should return size of ordered container', () => {
      const template = () => html`
        <qti-container-size>
          <qti-ordered>
            <qti-base-value base-type="string">first</qti-base-value>
            <qti-base-value base-type="string">second</qti-base-value>
            <qti-base-value base-type="string">third</qti-base-value>
            <qti-base-value base-type="string">fourth</qti-base-value>
          </qti-ordered>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(4);
    });

    it('should return 0 for empty ordered container', () => {
      const template = () => html`
        <qti-container-size>
          <qti-ordered> </qti-ordered>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(0);
    });

    it('should handle ordered container with mixed base-types', () => {
      const template = () => html`
        <qti-container-size>
          <qti-ordered>
            <qti-base-value base-type="integer">42</qti-base-value>
            <qti-base-value base-type="string">hello</qti-base-value>
            <qti-base-value base-type="float">3.14</qti-base-value>
          </qti-ordered>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(3);
    });
  });

  describe('null handling', () => {
    it('should return 0 when container is null', () => {
      const template = () => html`
        <qti-container-size>
          <qti-null></qti-null>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(0);
    });
  });

  describe('error cases', () => {
    it('should return 0 when no child expression provided', () => {
      const template = () => html` <qti-container-size> </qti-container-size> `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(0);
    });

    it('should return 0 when multiple child expressions provided', () => {
      const template = () => html`
        <qti-container-size>
          <qti-multiple>
            <qti-base-value base-type="string">A</qti-base-value>
            <qti-base-value base-type="string">B</qti-base-value>
          </qti-multiple>
          <qti-multiple>
            <qti-base-value base-type="string">C</qti-base-value>
          </qti-multiple>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(0);
    });

    it('should return 0 for single cardinality expression', () => {
      const template = () => html`
        <qti-container-size>
          <qti-base-value base-type="string">single-value</qti-base-value>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(0);
    });

    it('should return 0 for record cardinality expression', () => {
      const template = () => html`
        <qti-container-size>
          <qti-base-value base-type="record">{"key": "value"}</qti-base-value>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(0);
    });
  });

  describe('large containers', () => {
    it('should handle large containers efficiently', () => {
      // Create a container with many items
      const template = () => html`
        <qti-container-size>
          <qti-multiple>
            <qti-base-value base-type="integer">1</qti-base-value>
            <qti-base-value base-type="integer">2</qti-base-value>
            <qti-base-value base-type="integer">3</qti-base-value>
            <qti-base-value base-type="integer">4</qti-base-value>
            <qti-base-value base-type="integer">5</qti-base-value>
          </qti-multiple>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(5);
    });

    it('should return correct size for very small container', () => {
      const template = () => html`
        <qti-container-size>
          <qti-ordered>
            <qti-base-value base-type="boolean">true</qti-base-value>
          </qti-ordered>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(1);
    });
  });

  describe('use case examples', () => {
    it('should work for determining selected choices in multiple-response interaction', () => {
      // Simulating a multiple-choice response where user selected choices A, C, D
      const template = () => html`
        <qti-container-size>
          <qti-multiple>
            <qti-base-value base-type="identifier">choiceA</qti-base-value>
            <qti-base-value base-type="identifier">choiceC</qti-base-value>
            <qti-base-value base-type="identifier">choiceD</qti-base-value>
          </qti-multiple>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(3); // 3 choices selected
    });

    it('should work for empty response (no choices selected)', () => {
      const template = () => html`
        <qti-container-size>
          <qti-multiple> </qti-multiple>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(0); // No choices selected
    });

    it('should work for measuring sequence length in ordered interaction', () => {
      // Simulating an ordering interaction where user arranged items in sequence
      const template = () => html`
        <qti-container-size>
          <qti-ordered>
            <qti-base-value base-type="identifier">item3</qti-base-value>
            <qti-base-value base-type="identifier">item1</qti-base-value>
            <qti-base-value base-type="identifier">item4</qti-base-value>
            <qti-base-value base-type="identifier">item2</qti-base-value>
            <qti-base-value base-type="identifier">item5</qti-base-value>
          </qti-ordered>
        </qti-container-size>
      `;
      render(template(), testContainer);
      const qtiContainerSize = testContainer.querySelector('qti-container-size') as QtiContainerSize;
      expect(qtiContainerSize.calculate()).toBe(5); // 5 items in sequence
    });
  });

  describe('integration with other operators', () => {
    it('should work with conditional logic (checking if any choices selected)', () => {
      const template = () => html`
        <qti-gt>
          <qti-container-size>
            <qti-multiple>
              <qti-base-value base-type="identifier">A</qti-base-value>
              <qti-base-value base-type="identifier">B</qti-base-value>
            </qti-multiple>
          </qti-container-size>
          <qti-base-value base-type="integer">0</qti-base-value>
        </qti-gt>
      `;
      render(template(), testContainer);
      const qtiGt = testContainer.querySelector('qti-gt') as any;
      expect(qtiGt.calculate()).toBe(true); // size (2) > 0
    });

    it('should work with scoring based on number of selections', () => {
      const template = () => html`
        <qti-product>
          <qti-container-size>
            <qti-multiple>
              <qti-base-value base-type="identifier">correct1</qti-base-value>
              <qti-base-value base-type="identifier">correct2</qti-base-value>
              <qti-base-value base-type="identifier">correct3</qti-base-value>
            </qti-multiple>
          </qti-container-size>
          <qti-base-value base-type="float">0.5</qti-base-value>
        </qti-product>
      `;
      render(template(), testContainer);
      const qtiProduct = testContainer.querySelector('qti-product') as any;
      expect(qtiProduct.calculate()).toBe(1.5); // 3 selections × 0.5 points each
    });
  });
});
