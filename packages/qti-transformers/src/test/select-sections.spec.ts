import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { qtiTransformTest } from '../qti-transform-test';
import { resetMissingSeedWarning } from '../shared/missing-seed-warning';

/**
 * `qti-selection` at load (implementation guide §4.5.1): which item-refs and subsections a section
 * presents, the same for the same seed, before ordering shuffles them (§4.5.2).
 */

const xml = String.raw;

const refs = (...ids: string[]) =>
  ids.map(id => `<qti-assessment-item-ref identifier="${id}" href="${id}.xml" />`).join('\n');

const test = (sections: string) => xml`
  <qti-assessment-test identifier="T" title="T">
    <qti-test-part identifier="P" navigation-mode="nonlinear" submission-mode="individual">
      ${sections}
    </qti-test-part>
  </qti-assessment-test>`;

/** The suite's S3-S4 sample, in short: section A selects 2 of 3 with item 1 required, B 2 of 3 shuffled. */
const S3_S4 = test(xml`
  <qti-assessment-section identifier="sectionA" title="A" visible="true">
    <qti-selection select="2" />
    <qti-ordering shuffle="false" />
    <qti-rubric-block view="candidate"><qti-content-body><p>Instructions for Section A</p></qti-content-body></qti-rubric-block>
    <qti-assessment-item-ref identifier="item-1" href="item-1.xml" required="true" />
    ${refs('item-2', 'item-3')}
  </qti-assessment-section>
  <qti-assessment-section identifier="sectionB" title="B" visible="true">
    <qti-selection select="2" />
    <qti-ordering shuffle="true" />
    <qti-rubric-block view="candidate"><qti-content-body><p>Instructions for Section B</p></qti-content-body></qti-rubric-block>
    ${refs('item-4', 'item-5', 'item-6')}
  </qti-assessment-section>`);

const SEEDS = Array.from({ length: 30 }, (_, i) => `seed-${i}`);

const transform = (source: string, seed?: string) => qtiTransformTest().parse(source).applySelection(seed);
const itemIds = (source: string, seed?: string) =>
  transform(source, seed)
    .items()
    .map(item => item.identifier);
const elementIds = (doc: XMLDocument, localName: string) =>
  Array.from(doc.getElementsByTagName(localName)).map(el => el.getAttribute('identifier'));

describe('applySelection', () => {
  it('selects 2 of 3 in section A, always with the required item 1 (S3-L2-D1)', () => {
    const seen = new Set<string>();
    for (const seed of SEEDS) {
      const sectionA = itemIds(S3_S4, seed).filter(id => ['item-1', 'item-2', 'item-3'].includes(id));
      expect(sectionA).toHaveLength(2);
      expect(sectionA[0]).toBe('item-1');
      seen.add(sectionA[1]);
    }
    expect(seen).toEqual(new Set(['item-2', 'item-3']));
  });

  it('selects 2 of 3 in section B, any of them (S3-L2-D2)', () => {
    const seen = new Set<string>();
    for (const seed of SEEDS) {
      const sectionB = itemIds(S3_S4, seed).filter(id => ['item-4', 'item-5', 'item-6'].includes(id));
      expect(sectionB).toHaveLength(2);
      sectionB.forEach(id => seen.add(id));
    }
    expect(seen).toEqual(new Set(['item-4', 'item-5', 'item-6']));
  });

  it('selects the same items for the same seed', () => {
    for (const seed of SEEDS) expect(itemIds(S3_S4, seed)).toEqual(itemIds(S3_S4, seed));
    expect(new Set(SEEDS.map(seed => itemIds(S3_S4, seed).join())).size).toBeGreaterThan(1);
  });

  it('keeps the selected items in authored order, for ordering to shuffle', () => {
    for (const seed of SEEDS) {
      const ids = itemIds(S3_S4, seed);
      expect(ids).toEqual([...ids].sort());
    }
  });

  it('consumes qti-selection and leaves the rubric blocks and qti-ordering', () => {
    const doc = transform(S3_S4, 'a').xmlDoc();
    expect(doc.getElementsByTagName('qti-selection')).toHaveLength(0);
    expect(doc.getElementsByTagName('qti-rubric-block')).toHaveLength(2);
    expect(doc.getElementsByTagName('qti-ordering')).toHaveLength(2);
  });

  it('shuffles only the selected items afterwards (S4-L2-D1)', () => {
    for (const seed of SEEDS) {
      const selected = itemIds(S3_S4, seed);
      const ordered = qtiTransformTest()
        .parse(S3_S4)
        .applySelection(seed)
        .shuffleOrdering(seed)
        .items()
        .map(item => item.identifier);
      expect([...ordered].sort()).toEqual(selected);
    }
  });

  it('leaves a test without qti-selection as it was, so its order does not change', () => {
    const plain = test(xml`
      <qti-assessment-section identifier="S1" title="S1" visible="true">
        <qti-ordering shuffle="true" />
        ${refs('I1', 'I2', 'I3', 'I4', 'I5', 'I6')}
      </qti-assessment-section>`);
    for (const seed of SEEDS.slice(0, 5)) {
      const before = qtiTransformTest().parse(plain).shuffleOrdering(seed).xml();
      expect(qtiTransformTest().parse(plain).applySelection(seed).shuffleOrdering(seed).xml()).toBe(before);
    }
  });

  it('counts a subsection as one, removes an unselected one whole, and selects inside a selected one', () => {
    const source = test(xml`
      <qti-assessment-section identifier="S1" title="S1" visible="true">
        <qti-selection select="2" />
        ${refs('I1')}
        <qti-assessment-section identifier="S2" title="S2" visible="true" required="true">
          <qti-selection select="1" />
          ${refs('I2', 'I3', 'I4')}
        </qti-assessment-section>
        ${refs('I5')}
      </qti-assessment-section>`);
    for (const seed of SEEDS) {
      const doc = transform(source, seed).xmlDoc();
      const ids = elementIds(doc, 'qti-assessment-item-ref');
      expect(elementIds(doc, 'qti-assessment-section')).toEqual(['S1', 'S2']);
      expect(ids.filter(id => ['I2', 'I3', 'I4'].includes(id!))).toHaveLength(1);
      expect(ids.filter(id => ['I1', 'I5'].includes(id!))).toHaveLength(1);
    }
    const unselected = test(xml`
      <qti-assessment-section identifier="S1" title="S1" visible="true">
        <qti-selection select="1" />
        <qti-assessment-item-ref identifier="I1" href="I1.xml" required="true" />
        <qti-assessment-section identifier="S2" title="S2" visible="true">${refs('I2')}</qti-assessment-section>
      </qti-assessment-section>`);
    expect(elementIds(transform(unselected, 'a').xmlDoc(), 'qti-assessment-section')).toEqual(['S1']);
  });

  it('ignores a qti-selection with attributes or children it does not know', () => {
    // Implementation guide §4.5.1: the delivery engine "should ignore the qti-selection entirely".
    for (const selection of [
      '<qti-selection select="1" algorithm="by-difficulty" />',
      '<qti-selection select="1"><by-difficulty /></qti-selection>'
    ]) {
      const source = test(
        `<qti-assessment-section identifier="S1" title="S1" visible="true">${selection}${refs('I1', 'I2', 'I3')}</qti-assessment-section>`
      );
      expect(itemIds(source, 'a')).toEqual(['I1', 'I2', 'I3']);
    }
  });

  it('rejects a test whose selection QTI calls an error, naming the section', () => {
    const tooFew = test(xml`
      <qti-assessment-section identifier="S1" title="S1" visible="true">
        <qti-selection select="1" />
        <qti-assessment-item-ref identifier="I1" href="I1.xml" required="true" />
        <qti-assessment-item-ref identifier="I2" href="I2.xml" required="true" />
      </qti-assessment-section>`);
    expect(() => transform(tooFew, 'a')).toThrow(/S1.*required/);
    const tooMany = test(
      `<qti-assessment-section identifier="S1" title="S1" visible="true"><qti-selection select="3" />${refs('I1', 'I2')}</qti-assessment-section>`
    );
    expect(() => transform(tooMany, 'a')).toThrow(/S1.*with-replacement/);
  });

  describe('with-replacement', () => {
    it('clones an item-ref as item-3#2, next to the original', () => {
      const source = test(
        `<qti-assessment-section identifier="S1" title="S1" visible="true"><qti-selection select="5" with-replacement="true" />${refs('I1', 'I2')}</qti-assessment-section>`
      );
      for (const seed of SEEDS) {
        const ids = itemIds(source, seed);
        expect(ids).toHaveLength(5);
        const byRef = (ref: string) => ids.filter(id => id === ref || id!.startsWith(`${ref}#`));
        for (const ref of ['I1', 'I2']) {
          const instances = byRef(ref);
          expect(instances).toEqual([ref, ...instances.slice(1).map((_, i) => `${ref}#${i + 2}`)]);
        }
        expect(ids).toEqual([...byRef('I1'), ...byRef('I2')]);
      }
    });

    it('clones a subsection with its items, each clone selecting on its own', () => {
      const source = test(xml`
        <qti-assessment-section identifier="S1" title="S1" visible="true">
          <qti-selection select="3" with-replacement="true" />
          <qti-assessment-section identifier="S2" title="S2" visible="true">
            <qti-selection select="1" />
            ${refs('I1', 'I2', 'I3', 'I4')}
          </qti-assessment-section>
        </qti-assessment-section>`);
      const differ = SEEDS.some(seed => {
        const doc = transform(source, seed).xmlDoc();
        expect(elementIds(doc, 'qti-assessment-section')).toEqual(['S1', 'S2', 'S2#2', 'S2#3']);
        const ids = elementIds(doc, 'qti-assessment-item-ref') as string[];
        expect(ids).toHaveLength(3);
        expect(new Set(ids).size).toBe(3);
        return new Set(ids.map(id => id.split('#')[0])).size > 1;
      });
      expect(differ).toBe(true);
    });
  });

  describe('without a seed', () => {
    beforeEach(() => resetMissingSeedWarning());
    afterEach(() => vi.restoreAllMocks());

    it('falls back to a fixed seed, with the warning', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(itemIds(S3_S4)).toEqual(itemIds(S3_S4));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('deterministic fallback seed'));
    });

    it('stays quiet when nothing is selected', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      transform(
        test(`<qti-assessment-section identifier="S1" title="S1" visible="true">${refs('I1')}</qti-assessment-section>`)
      );
      expect(warn).not.toHaveBeenCalled();
    });
  });
});
