import { expect, describe, it, beforeEach, afterEach } from 'vitest';

import '../../register';

import type { TestContext } from '@qti-components/base';
import type { QtiNumberPresented } from './qti-number-presented';

describe('qti-number-presented', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  const sections = `
    <qti-assessment-section identifier="S1">
      <qti-assessment-item-ref identifier="ITEM-1"></qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="ITEM-2" category="dep-informational"></qti-assessment-item-ref>
    </qti-assessment-section>
    <qti-assessment-section identifier="S2">
      <qti-assessment-item-ref identifier="ITEM-3" category="alpha"></qti-assessment-item-ref>
      <qti-assessment-item-ref identifier="ITEM-4" category="alpha"></qti-assessment-item-ref>
    </qti-assessment-section>`;

  /** completionStatus per item ref, as the test context holds it. */
  const contextWith = (statuses: Record<string, string>): TestContext => ({
    items: Object.entries(statuses).map(([identifier, value]) => ({
      identifier,
      variables: [{ identifier: 'completionStatus', value, type: 'outcome' }]
    }))
  });

  const mount = async (attributes: string, statuses: Record<string, string>): Promise<QtiNumberPresented> => {
    container.innerHTML = `
      <qti-assessment-test identifier="TEST">
        <qti-test-part identifier="PART">${sections}</qti-test-part>
        <qti-outcome-processing>
          <qti-set-outcome-value identifier="COUNT">
            <qti-number-presented ${attributes}></qti-number-presented>
          </qti-set-outcome-value>
        </qti-outcome-processing>
      </qti-assessment-test>`;
    const el = container.querySelector('qti-number-presented') as QtiNumberPresented;
    el._testContext = contextWith(statuses);
    await el.updateComplete;
    return el;
  };

  // ITEM-1 answered, ITEM-2 on screen, ITEM-3 passed over or not reached, ITEM-4 answered
  const route = { 'ITEM-1': 'completed', 'ITEM-2': 'unknown', 'ITEM-3': 'not_attempted', 'ITEM-4': 'incomplete' };

  it('counts the items whose completionStatus left not_attempted', async () => {
    expect((await mount('', route)).calculate()).toBe(3);
  });

  it('counts none before any item was presented', async () => {
    const fresh = { 'ITEM-1': 'not_attempted', 'ITEM-2': 'not_attempted', 'ITEM-3': 'not_attempted' };
    expect((await mount('', fresh)).calculate()).toBe(0);
  });

  it('counts only the presented items of a named section', async () => {
    expect((await mount('section-identifier="S2"', route)).calculate()).toBe(1);
  });

  it('drops the items carrying an excluded category', async () => {
    expect((await mount('exclude-category="dep-informational"', route)).calculate()).toBe(2);
  });

  it('keeps only the items carrying an included category', async () => {
    expect((await mount('include-category="alpha"', route)).calculate()).toBe(1);
  });

  it('does not count an item ref the test context does not know', async () => {
    expect((await mount('', { 'ITEM-1': 'completed' })).calculate()).toBe(1);
  });

  it('returns 0 outside an assessment test instead of throwing', async () => {
    container.innerHTML = `<qti-number-presented></qti-number-presented>`;
    const el = container.querySelector('qti-number-presented') as QtiNumberPresented;
    await el.updateComplete;
    expect(el.calculate()).toBe(0);
  });
});
