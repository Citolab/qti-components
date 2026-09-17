import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import '../../register';

import type { QtiTestVariables } from './qti-test-variables';
import type { TestContext } from '@qti-components/base';
import type { OutcomeVariable } from '@qti-components/base';

/**
 * `qti-test-variables` aggregates an item-level variable across the test. It
 * resolves the item refs through the DOM (for their categories and weights) and
 * their values through the test context, so a spec has to supply both.
 */
describe('qti-test-variables', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  const scoreOf = (identifier: string, score: number | string) => ({
    identifier,
    variables: [{ identifier: 'SCORE', value: String(score), type: 'outcome' } as OutcomeVariable]
  });

  /**
   * A test document shaped like the real thing: the expression sits inside the
   * test's own `qti-outcome-processing`, below the item refs it aggregates.
   */
  const mount = async (attributes: string, itemRefs: string, testContext: TestContext): Promise<QtiTestVariables> => {
    container.innerHTML = `
      <qti-assessment-test identifier="TEST">
        <qti-test-part identifier="PART">
          <qti-assessment-section identifier="SECTION">${itemRefs}</qti-assessment-section>
        </qti-test-part>
        <qti-outcome-processing>
          <qti-set-outcome-value identifier="SCORE">
            <qti-test-variables variable-identifier="SCORE" ${attributes}></qti-test-variables>
          </qti-set-outcome-value>
        </qti-outcome-processing>
      </qti-assessment-test>`;
    const el = container.querySelector('qti-test-variables') as QtiTestVariables;
    await el.updateComplete;
    el._testContext = testContext;
    return el;
  };

  const threeItems = `
    <qti-assessment-item-ref identifier="ITEM-1"></qti-assessment-item-ref>
    <qti-assessment-item-ref identifier="ITEM-2" category="dep-informational"></qti-assessment-item-ref>
    <qti-assessment-item-ref identifier="ITEM-3" category="alpha beta"></qti-assessment-item-ref>`;

  const threeScores: TestContext = {
    items: [scoreOf('ITEM-1', 1), scoreOf('ITEM-2', 10), scoreOf('ITEM-3', 100)]
  };

  it('sums the variable across every item ref', async () => {
    const el = await mount('', threeItems, threeScores);
    expect(el.calculate()).toBe(111);
  });

  it('drops the items carrying an excluded category', async () => {
    const el = await mount('exclude-category="dep-informational"', threeItems, threeScores);
    expect(el.calculate()).toBe(101);
  });

  it('keeps only the items carrying an included category', async () => {
    const el = await mount('include-category="alpha"', threeItems, threeScores);
    expect(el.calculate()).toBe(100);
  });

  it('matches a category anywhere in an item ref of several', async () => {
    const el = await mount('include-category="beta"', threeItems, threeScores);
    expect(el.calculate()).toBe(100);
  });

  it('applies include and exclude together rather than letting exclude decide alone', async () => {
    const itemRefs = `
      <qti-assessment-item-ref identifier="ITEM-1" category="scored"></qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="ITEM-2" category="scored dropped"></qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="ITEM-3" category="other"></qti-assessment-item-ref>`;
    const el = await mount('include-category="scored" exclude-category="dropped"', itemRefs, threeScores);
    // ITEM-2 is excluded, ITEM-3 is not included: only ITEM-1 contributes.
    expect(el.calculate()).toBe(1);
  });

  it('weights each item by the named qti-weight', async () => {
    const itemRefs = `
      <qti-assessment-item-ref identifier="ITEM-1">
        <qti-weight identifier="WEIGHT" value="2"></qti-weight>
      </qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="ITEM-2">
        <qti-weight identifier="WEIGHT" value="0"></qti-weight>
      </qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="ITEM-3"></qti-assessment-item-ref>`;
    const el = await mount('weight-identifier="WEIGHT"', itemRefs, threeScores);
    // 1*2 + 10*0 + 100 (no weight declared, so 1)
    expect(el.calculate()).toBe(102);
  });

  it('ignores a weight declared under another identifier', async () => {
    const itemRefs = `
      <qti-assessment-item-ref identifier="ITEM-1">
        <qti-weight identifier="OTHER" value="5"></qti-weight>
      </qti-assessment-item-ref>`;
    const el = await mount('weight-identifier="WEIGHT"', itemRefs, { items: [scoreOf('ITEM-1', 3)] });
    expect(el.calculate()).toBe(3);
  });

  it('counts an item whose value is not a number as no contribution', async () => {
    const el = await mount('', threeItems, {
      items: [scoreOf('ITEM-1', 1), scoreOf('ITEM-2', 'not_attempted'), scoreOf('ITEM-3', 100)]
    });
    expect(el.calculate()).toBe(101);
  });

  it('returns 0 outside an assessment test instead of throwing', async () => {
    container.innerHTML = `<qti-test-variables variable-identifier="SCORE"></qti-test-variables>`;
    const el = container.querySelector('qti-test-variables') as QtiTestVariables;
    await el.updateComplete;
    el._testContext = threeScores;
    expect(el.calculate()).toBe(0);
  });
});
