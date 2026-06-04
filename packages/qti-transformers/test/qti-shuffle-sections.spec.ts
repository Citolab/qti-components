const xml = String.raw;

import { qtiTransformTest } from '../src/qti-transform-test';

const order = (xmlStr: string, seed: string | number): string[] =>
  qtiTransformTest()
    .parse(xmlStr)
    .shuffleOrdering(seed)
    .items()
    .map(i => i.identifier);

const flatSectionIds = (xmlStr: string, seed: string | number): string[] => {
  const doc = qtiTransformTest().parse(xmlStr).shuffleOrdering(seed).xmlDoc();
  return Array.from(doc.getElementsByTagName('*'))
    .filter(e => e.localName === 'qti-assessment-section')
    .map(e => e.getAttribute('identifier') ?? '');
};

const countOrderingElements = (xmlStr: string, seed: string | number): number =>
  qtiTransformTest().parse(xmlStr).shuffleOrdering(seed).xmlDoc().getElementsByTagName('qti-ordering').length;

const wrap = (sectionInner: string) => xml`
  <qti-assessment-test>
    <qti-test-part identifier="P1">
      <qti-assessment-section identifier="S1">
        <qti-ordering shuffle="true" />
        ${sectionInner}
      </qti-assessment-section>
    </qti-test-part>
  </qti-assessment-test>`;

const refs = (...ids: string[]) =>
  ids.map(id => `<qti-assessment-item-ref identifier="${id}" href="${id}.xml" />`).join('\n');

describe('shuffleOrdering', () => {
  const EIGHT = wrap(refs('I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8'));

  it('is deterministic for the same seed and a permutation of the input', () => {
    const a = order(EIGHT, 'seed-abc');
    const b = order(EIGHT, 'seed-abc');
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual(['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8']);
  });

  it('actually reorders for at least one seed', () => {
    const identity = ['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8'];
    const someReordered = [0, 1, 2, 3, 4].some(s => JSON.stringify(order(EIGHT, s)) !== JSON.stringify(identity));
    expect(someReordered).toBe(true);
  });

  it('different seeds generally produce different orders', () => {
    expect(order(EIGHT, 'A')).not.toEqual(order(EIGHT, 'B'));
  });

  it('keeps fixed items in their authored position', () => {
    const doc = wrap(
      `${refs('I1')}
       <qti-assessment-item-ref identifier="I2" href="I2.xml" fixed="true" />
       ${refs('I3', 'I4', 'I5')}`
    );
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      // I2 is authored at index 1 and must stay there.
      expect(order(doc, seed)[1]).toBe('I2');
    }
  });

  it('does not touch a section without qti-ordering shuffle', () => {
    const doc = xml`
      <qti-assessment-test>
        <qti-test-part identifier="P1">
          <qti-assessment-section identifier="S1">
            ${refs('I1', 'I2', 'I3', 'I4')}
          </qti-assessment-section>
        </qti-test-part>
      </qti-assessment-test>`;
    expect(order(doc, 'seed')).toEqual(['I1', 'I2', 'I3', 'I4']);
  });

  it('removes consumed qti-ordering elements after shuffle', () => {
    expect(countOrderingElements(EIGHT, 'seed-abc')).toBe(0);
  });

  it('moves a keep-together child section as a grouped block', () => {
    const doc = wrap(
      `${refs('Ia')}
       <qti-assessment-section identifier="S2" keep-together="true">
         ${refs('Ib', 'Ic')}
       </qti-assessment-section>
       ${refs('Id')}`
    );
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      const o = order(doc, seed);
      const ib = o.indexOf('Ib');
      // Ib and Ic stay adjacent and in order.
      expect(o[ib + 1]).toBe('Ic');
    }
    // The block wrapper survives.
    expect(flatSectionIds(doc, 'a')).toContain('S2');
  });

  it('dissolves an invisible, non-keep-together child section (interleave)', () => {
    const doc = wrap(
      `${refs('Ia')}
       <qti-assessment-section identifier="S2" visible="false" keep-together="false">
         ${refs('Ib', 'Ic')}
       </qti-assessment-section>
       ${refs('Id')}`
    );
    const o = order(doc, 'seed-x');
    expect([...o].sort()).toEqual(['Ia', 'Ib', 'Ic', 'Id']);
    // Wrapper is gone; its items were promoted into the parent.
    expect(flatSectionIds(doc, 'seed-x')).not.toContain('S2');
  });

  it('orders nested children before the parent reorders the block', () => {
    const doc = wrap(
      `<qti-assessment-section identifier="S2" keep-together="true">
         <qti-ordering shuffle="true" />
         ${refs('Ib', 'Ic', 'Id', 'Ie', 'If')}
       </qti-assessment-section>
       ${refs('Ia')}`
    );
    // The nested block keeps its 5 items contiguous (in whatever internal order).
    const o = order(doc, 'nested');
    const positions = ['Ib', 'Ic', 'Id', 'Ie', 'If'].map(id => o.indexOf(id));
    const min = Math.min(...positions);
    const max = Math.max(...positions);
    expect(max - min).toBe(4);
  });
});
