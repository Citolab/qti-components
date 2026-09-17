import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import '../../register';

import type { QtiNumberSelected } from './qti-number-selected';

describe('qti-number-selected', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  const mount = async (attributes: string, sections: string): Promise<QtiNumberSelected> => {
    container.innerHTML = `
      <qti-assessment-test identifier="TEST">
        <qti-test-part identifier="PART">${sections}</qti-test-part>
        <qti-outcome-processing>
          <qti-set-outcome-value identifier="COUNT">
            <qti-number-selected ${attributes}></qti-number-selected>
          </qti-set-outcome-value>
        </qti-outcome-processing>
      </qti-assessment-test>`;
    const el = container.querySelector('qti-number-selected') as QtiNumberSelected;
    await el.updateComplete;
    return el;
  };

  const sections = `
    <qti-assessment-section identifier="S1">
      <qti-assessment-item-ref identifier="ITEM-1"></qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="ITEM-2" category="dep-informational"></qti-assessment-item-ref>
    </qti-assessment-section>
    <qti-assessment-section identifier="S2">
      <qti-assessment-item-ref identifier="ITEM-3" category="alpha beta"></qti-assessment-item-ref>
    </qti-assessment-section>`;

  it('counts every item ref in the test', async () => {
    expect((await mount('', sections)).calculate()).toBe(3);
  });

  it('counts only the items of a named section', async () => {
    expect((await mount('section-identifier="S1"', sections)).calculate()).toBe(2);
  });

  it('drops the items carrying an excluded category', async () => {
    expect((await mount('exclude-category="dep-informational"', sections)).calculate()).toBe(2);
  });

  it('keeps only the items carrying an included category', async () => {
    expect((await mount('include-category="alpha"', sections)).calculate()).toBe(1);
  });

  it('applies a section and a category filter together', async () => {
    expect((await mount('section-identifier="S1" exclude-category="dep-informational"', sections)).calculate()).toBe(1);
  });

  it('returns 0 for a section identifier the test does not have', async () => {
    expect((await mount('section-identifier="NOPE"', sections)).calculate()).toBe(0);
  });

  it('returns 0 outside an assessment test instead of throwing', async () => {
    container.innerHTML = `<qti-number-selected></qti-number-selected>`;
    const el = container.querySelector('qti-number-selected') as QtiNumberSelected;
    await el.updateComplete;
    expect(el.calculate()).toBe(0);
  });
});
