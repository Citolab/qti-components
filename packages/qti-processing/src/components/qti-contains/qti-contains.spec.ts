import '@citolab/qti-components';
import { describe, it, expect } from 'vitest';
import { html, render } from 'lit';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { QtiContains } from './qti-contains';

describe('qti-contains', () => {
  it('should check if the variable identified in the first child is contained in the second one', () => {
    const template = () => html`
      <qti-assessment-item>
        <qti-response-declaration identifier="gapmatch_1" cardinality="multiple" base-type="directedPair">
          <qti-correct-response>
            <qti-value>GT1 G1</qti-value>
          </qti-correct-response>
        </qti-response-declaration>
        <qti-contains>
          <qti-variable identifier="gapmatch_1"></qti-variable>
          <qti-multiple>
            <qti-base-value base-type="directedPair">GT1 G1</qti-base-value>
          </qti-multiple>
        </qti-contains>
      </qti-assessment-item>
    `;
    render(template(), document.body);

    const qtiContains = document.body.querySelector('qti-contains') as QtiContains;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;

    assessmentItem.updateResponseVariable('gapmatch_1', ['GT1 G1']);

    expect(qtiContains.calculate()).toBeTruthy();
  });

  it('should check if the first expression is contained in the second one', () => {
    const template = () =>
      html` <qti-assessment-item>
        <qti-response-declaration identifier="gapmatch_1" cardinality="single" base-type="directedPair">
        </qti-response-declaration>
        <qti-contains>
          <qti-variable identifier="gapmatch_1"></qti-variable>
          <qti-multiple>
            <qti-base-value base-type="directedPair">GTa Ga</qti-base-value>
            <qti-base-value base-type="directedPair">GTb Gb</qti-base-value>
            <qti-base-value base-type="directedPair">GTc Gc</qti-base-value>
          </qti-multiple>
        </qti-contains>
      </qti-assessment-item>`;
    render(template(), document.body);

    const qtiContains = document.body.querySelector('qti-contains') as QtiContains;
    const assessmentItem = document.body.querySelector('qti-assessment-item') as QtiAssessmentItem;
    assessmentItem.updateResponseVariable('gapmatch_1', 'GTb Gb');

    expect(qtiContains.calculate()).toBeTruthy();
  });
  describe('containment', () => {
    let testContainer: HTMLElement;

    beforeEach(() => {
      testContainer = document.createElement('div');
      document.body.appendChild(testContainer);
    });

    afterEach(() => testContainer.remove());

    /*
     * Written as markup rather than a lit template: the container tag varies
     * with cardinality, and lit does not allow a binding in a tag name.
     */
    const contains = (baseType: string, cardinality: 'multiple' | 'ordered', haystack: string[], needle: string[]) => {
      const wrapper = cardinality === 'ordered' ? 'qti-ordered' : 'qti-multiple';
      const container = (list: string[]) =>
        `<${wrapper}>${list
          .map(value => `<qti-base-value base-type="${baseType}">${value}</qti-base-value>`)
          .join('')}</${wrapper}>`;

      testContainer.innerHTML = `<qti-contains>${container(haystack)}${container(needle)}</qti-contains>`;
      return (testContainer.querySelector('qti-contains') as QtiContains).calculate();
    };

    describe('unordered containers', () => {
      it('holds a sub-multiset regardless of order', () => {
        expect(contains('identifier', 'multiple', ['A', 'B', 'C'], ['C', 'A'])).toBe(true);
      });

      /*
       * The bug this replaces: containment was tested as a non-empty
       * intersection, so a single shared value was enough and [A,B] "contained"
       * [A,C].
       */
      it('rejects a container that shares only some values', () => {
        expect(contains('identifier', 'multiple', ['A', 'B'], ['A', 'C'])).toBe(false);
      });

      it('respects multiplicity', () => {
        expect(contains('identifier', 'multiple', ['A', 'B'], ['A', 'A'])).toBe(false);
        expect(contains('identifier', 'multiple', ['A', 'A', 'B'], ['A', 'A'])).toBe(true);
      });

      it('holds itself', () => {
        expect(contains('identifier', 'multiple', ['A', 'B'], ['A', 'B'])).toBe(true);
      });
    });

    describe('ordered containers', () => {
      it('holds a contiguous sub-sequence', () => {
        expect(contains('identifier', 'ordered', ['A', 'B', 'C'], ['B', 'C'])).toBe(true);
      });

      it('rejects the same values in another order', () => {
        expect(contains('identifier', 'ordered', ['A', 'B', 'C'], ['C', 'A'])).toBe(false);
      });

      it('rejects a non-contiguous run', () => {
        expect(contains('identifier', 'ordered', ['A', 'B', 'C'], ['A', 'C'])).toBe(false);
      });
    });

    describe('base types beyond directedPair', () => {
      // Every one of these used to hit "unsupported baseType" and return false.
      it('works for identifiers', () => {
        expect(contains('identifier', 'multiple', ['A', 'B'], ['B'])).toBe(true);
      });

      it('works for strings', () => {
        expect(contains('string', 'multiple', ['red', 'green'], ['green'])).toBe(true);
      });

      it('compares integers numerically rather than as text', () => {
        expect(contains('integer', 'multiple', ['1', '02', '3'], ['2'])).toBe(true);
      });

      it('ignores the order within a pair', () => {
        expect(contains('pair', 'multiple', ['A B', 'C D'], ['B A'])).toBe(true);
      });

      it('respects the order within a directedPair', () => {
        expect(contains('directedPair', 'multiple', ['A B'], ['B A'])).toBe(false);
      });
    });

    it('is null when a sub-expression is null', () => {
      testContainer.innerHTML = `
        <qti-contains>
          <qti-multiple><qti-base-value base-type="identifier">A</qti-base-value></qti-multiple>
          <qti-null></qti-null>
        </qti-contains>`;
      expect((testContainer.querySelector('qti-contains') as QtiContains).calculate()).toBeNull();
    });
  });
});
