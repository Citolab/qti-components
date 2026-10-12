import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import '@qti-components/processing/register';
import '../register';

import { idOf, resolveNextItem } from './item-sequencing';

const bool = (value: boolean) => `<qti-base-value base-type="boolean">${value}</qti-base-value>`;
const preCondition = (value: boolean) => `<qti-pre-condition>${bool(value)}</qti-pre-condition>`;
const branch = (target: string, value = true) => `<qti-branch-rule target="${target}">${bool(value)}</qti-branch-rule>`;

describe('resolveNextItem', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => container.remove());

  /** Mounts a linear test part and returns its item refs; `A` is the item that was just presented. */
  const mount = (body: string): Element[] => {
    container.innerHTML = `
      <qti-assessment-test identifier="T">
        <qti-test-part identifier="P" navigation-mode="linear">${body}</qti-test-part>
      </qti-assessment-test>`;
    return [...container.querySelectorAll('qti-assessment-item-ref')];
  };
  const next = (refs: Element[], from = 'A') =>
    resolveNextItem(
      refs,
      refs.findIndex(r => idOf(r) === from)
    );

  it('is simply the following item without pre-conditions or branch rules', () => {
    const refs = mount(`
      <qti-assessment-section identifier="S">
        <qti-assessment-item-ref identifier="A"></qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="B"></qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(refs)).toEqual({ id: 'B', skipped: [] });
  });

  it('skips an item whose pre-condition is false', () => {
    const refs = mount(`
      <qti-assessment-section identifier="S">
        <qti-assessment-item-ref identifier="A"></qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="B">${preCondition(false)}</qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="C">${preCondition(true)}</qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(refs)).toEqual({ id: 'C', skipped: ['B'] });
  });

  it('skips a whole section whose pre-condition is false', () => {
    const refs = mount(`
      <qti-assessment-section identifier="S1">
        <qti-assessment-item-ref identifier="A"></qti-assessment-item-ref>
      </qti-assessment-section>
      <qti-assessment-section identifier="S2">${preCondition(false)}
        <qti-assessment-item-ref identifier="B"></qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="C"></qti-assessment-item-ref>
      </qti-assessment-section>
      <qti-assessment-section identifier="S3">
        <qti-assessment-item-ref identifier="D"></qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(refs)).toEqual({ id: 'D', skipped: ['B', 'C'] });
  });

  it('ends when every remaining item is skipped', () => {
    const refs = mount(`
      <qti-assessment-section identifier="S">
        <qti-assessment-item-ref identifier="A"></qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="B">${preCondition(false)}</qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(refs)).toEqual({ id: null, skipped: ['B'] });
  });

  it('follows a branch rule to an item and skips what is in between', () => {
    const refs = mount(`
      <qti-assessment-section identifier="S">
        <qti-assessment-item-ref identifier="A">${branch('C')}</qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="B"></qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="C"></qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(refs)).toEqual({ id: 'C', skipped: ['B'] });
  });

  it('ignores a branch rule that is false, and takes the first one that is true', () => {
    const refs = mount(`
      <qti-assessment-section identifier="S">
        <qti-assessment-item-ref identifier="A">${branch('B', false)}${branch('C')}${branch('D')}</qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="B"></qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="C"></qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="D"></qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(refs)).toEqual({ id: 'C', skipped: ['B'] });
  });

  it('ignores a branch target that is not ahead', () => {
    const refs = mount(`
      <qti-assessment-section identifier="S">
        <qti-assessment-item-ref identifier="A"></qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="B">${branch('A')}</qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="C"></qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(refs, 'B')).toEqual({ id: 'C', skipped: [] });
  });

  it('branches to a section', () => {
    const refs = mount(`
      <qti-assessment-section identifier="S1">
        <qti-assessment-item-ref identifier="A">${branch('S3')}</qti-assessment-item-ref>
      </qti-assessment-section>
      <qti-assessment-section identifier="S2">
        <qti-assessment-item-ref identifier="B"></qti-assessment-item-ref>
      </qti-assessment-section>
      <qti-assessment-section identifier="S3">
        <qti-assessment-item-ref identifier="C"></qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(refs)).toEqual({ id: 'C', skipped: ['B'] });
  });

  it('EXIT_SECTION continues after the section, EXIT_TEST ends the test', () => {
    const exitSection = mount(`
      <qti-assessment-section identifier="S1">
        <qti-assessment-item-ref identifier="A">${branch('EXIT_SECTION')}</qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="B"></qti-assessment-item-ref>
      </qti-assessment-section>
      <qti-assessment-section identifier="S2">
        <qti-assessment-item-ref identifier="C"></qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(exitSection)).toEqual({ id: 'C', skipped: ['B'] });

    const exitTest = mount(`
      <qti-assessment-section identifier="S">
        <qti-assessment-item-ref identifier="A">${branch('EXIT_TEST')}</qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="B"></qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(exitTest)).toEqual({ id: null, skipped: ['B'] });
  });

  it('only fires the branch rule of a section after its last item', () => {
    const refs = mount(`
      <qti-assessment-section identifier="S1">${branch('C')}
        <qti-assessment-item-ref identifier="A"></qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="B"></qti-assessment-item-ref>
      </qti-assessment-section>
      <qti-assessment-section identifier="S2">
        <qti-assessment-item-ref identifier="C"></qti-assessment-item-ref>
        <qti-assessment-item-ref identifier="D"></qti-assessment-item-ref>
      </qti-assessment-section>`);
    expect(next(refs, 'A')).toEqual({ id: 'B', skipped: [] });
    expect(next(refs, 'B')).toEqual({ id: 'C', skipped: [] });
  });
});
