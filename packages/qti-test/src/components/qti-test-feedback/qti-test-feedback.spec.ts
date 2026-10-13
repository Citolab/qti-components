import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import '../../register';

import type { QtiTest } from '../qti-test/qti-test';
import type { QtiTestFeedback } from './qti-test-feedback';

describe('qti-test-feedback', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  const feedback = async (attributes: string): Promise<QtiTestFeedback> => {
    container.innerHTML = `<qti-test-feedback outcome-identifier="FEEDBACK" ${attributes}></qti-test-feedback>`;
    const el = container.querySelector('qti-test-feedback') as QtiTestFeedback;
    await el.updateComplete;
    return el;
  };

  describe('matches', () => {
    it('applies with show-hide="show" when the value is its identifier', async () => {
      const el = await feedback('identifier="GOOD" show-hide="show"');
      expect(el.matches('GOOD')).toBe(true);
      expect(el.matches('BAD')).toBe(false);
      expect(el.matches(null)).toBe(false);
    });

    it('applies with show-hide="hide" when the value is not its identifier', async () => {
      const el = await feedback('identifier="GOOD" show-hide="hide"');
      expect(el.matches('GOOD')).toBe(false);
      expect(el.matches('BAD')).toBe(true);
      expect(el.matches(null)).toBe(true);
    });

    it('applies when a container value holds its identifier', async () => {
      const el = await feedback('identifier="GOOD" show-hide="show"');
      expect(el.matches(['OTHER', 'GOOD'])).toBe(true);
      expect(el.matches(['OTHER'])).toBe(false);
    });

    it('defaults access to atEnd', async () => {
      expect((await feedback('identifier="GOOD"')).access).toBe('atEnd');
      expect((await feedback('identifier="GOOD" access="during"')).access).toBe('during');
    });
  });

  describe('qtiTest.getTestFeedback', () => {
    const mountTest = async (value: string): Promise<QtiTest> => {
      container.innerHTML = `
        <qti-test>
          <qti-test-feedback identifier="PASSED" outcome-identifier="FEEDBACK" show-hide="show" access="atEnd"></qti-test-feedback>
          <qti-test-feedback identifier="FAILED" outcome-identifier="FEEDBACK" show-hide="show" access="atEnd"></qti-test-feedback>
          <qti-test-feedback identifier="PASSED" outcome-identifier="FEEDBACK" show-hide="show" access="during"></qti-test-feedback>
        </qti-test>`;
      const test = container.querySelector('qti-test') as QtiTest;
      test.testContext = {
        items: [],
        testOutcomeVariables: [
          { identifier: 'FEEDBACK', value, cardinality: 'single', baseType: 'identifier', type: 'outcome' }
        ]
      };
      await test.updateComplete;
      return test;
    };

    it('returns the feedback whose outcome matches', async () => {
      const test = await mountTest('PASSED');
      expect(test.getTestFeedback().map(fb => `${fb.getAttribute('identifier')}:${fb.access}`)).toEqual([
        'PASSED:atEnd',
        'PASSED:during'
      ]);
    });

    it('narrows the feedback to one access', async () => {
      const test = await mountTest('FAILED');
      expect(test.getTestFeedback('atEnd').map(fb => fb.getAttribute('identifier'))).toEqual(['FAILED']);
      expect(test.getTestFeedback('during')).toEqual([]);
    });
  });
});
