import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import '@citolab/qti-components';

import { qtiTransformItem } from '@qti-components/transformers';

import exponentialItem from './fixtures/spec-examples/items/exponential.xml?raw';
import sineRuleItem from './fixtures/spec-examples/items/sine-rule.xml?raw';

import type { QtiAssessmentItem } from '@qti-components/elements';

/**
 * Whole items whose answer is COMPUTED, which nothing else here covers: template
 * processing works one out with qti-divide / qti-math-operator, and response
 * processing compares the candidate against it with qti-equal-rounded.
 *
 * The template values are randomised on every run, so these assert the
 * relationships between them rather than fixed numbers — which is the stronger
 * check anyway, and the only honest one against a random draw.
 */
describe('items that compute their own answer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  const mount = async (xml: string): Promise<QtiAssessmentItem> => {
    container.innerHTML = qtiTransformItem().parse(xml).html();
    const item = container.querySelector('qti-assessment-item') as QtiAssessmentItem;
    await item.updateComplete;
    // Template processing runs asynchronously once the item connects.
    await new Promise(resolve => setTimeout(resolve, 0));
    return item;
  };

  const variable = (item: QtiAssessmentItem, identifier: string) =>
    item.variables.find(v => v.identifier === identifier)?.value;

  const num = (item: QtiAssessmentItem, identifier: string) => Number(variable(item, identifier));

  describe('sine rule', () => {
    it('computes pi/180 with qti-divide over qti-math-constant', async () => {
      expect(num(await mount(sineRuleItem), 'fPiOver180')).toBeCloseTo(Math.PI / 180, 12);
    });

    it('takes the sine of each angle converted to radians', async () => {
      const item = await mount(sineRuleItem);
      expect(num(item, 'sinA')).toBeCloseTo(Math.sin(num(item, 'iA') * (Math.PI / 180)), 12);
      expect(num(item, 'sinB')).toBeCloseTo(Math.sin(num(item, 'iB') * (Math.PI / 180)), 12);
    });

    it('divides the product by the sine to reach the answer', async () => {
      const item = await mount(sineRuleItem);
      expect(num(item, 'fAns')).toBeCloseTo((num(item, 'ia') * num(item, 'sinB')) / num(item, 'sinA'), 10);
    });

    it('draws its angles from the ranges the template declares', async () => {
      const item = await mount(sineRuleItem);
      expect([45, 60, 75, 90]).toContain(num(item, 'iA'));
      expect(num(item, 'iB')).toBeGreaterThanOrEqual(50);
      expect(num(item, 'iB')).toBeLessThanOrEqual(85);
    });

    it('scores the computed answer given to 3 significant figures', async () => {
      const item = await mount(sineRuleItem);
      const answer = num(item, 'fAns');
      item.updateResponseVariable('RESPONSE1', answer.toPrecision(3));
      item.processResponse();

      expect(variable(item, 'SCORE')).toBe('10.0');
    });

    it('scores nothing for an answer that is wrong beyond the rounding', async () => {
      const item = await mount(sineRuleItem);
      item.updateResponseVariable('RESPONSE1', String(num(item, 'fAns') * 2 + 1));
      item.processResponse();

      expect(variable(item, 'SCORE')).toBe('0.0');
    });

    // The is-null branch writes a literal 0, where an unmatched response just
    // leaves SCORE at the 0.0 its declaration defaulted it to.
    it('scores nothing for no response at all', async () => {
      const item = await mount(sineRuleItem);
      item.processResponse();

      expect(variable(item, 'SCORE')).toBe('0');
    });
  });

  describe('exponential', () => {
    it('computes e to the drawn power', async () => {
      const item = await mount(exponentialItem);
      const power = num(item, 'iA');
      expect(power).toBeGreaterThanOrEqual(1);
      expect(power).toBeLessThanOrEqual(4);
      expect(num(item, 'fAns')).toBeCloseTo(Math.exp(power), 10);
    });

    it('scores the answer given to 3 decimal places', async () => {
      const item = await mount(exponentialItem);
      item.updateResponseVariable('RESPONSE', num(item, 'fAns').toFixed(3));
      item.processResponse();

      expect(variable(item, 'SCORE')).toBe('1.0');
    });

    it('scores nothing for an answer wrong beyond 3 decimal places', async () => {
      const item = await mount(exponentialItem);
      item.updateResponseVariable('RESPONSE', (num(item, 'fAns') + 0.01).toFixed(3));
      item.processResponse();

      expect(variable(item, 'SCORE')).toBe('0');
    });
  });
});
