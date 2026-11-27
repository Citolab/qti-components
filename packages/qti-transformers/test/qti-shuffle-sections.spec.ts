const xml = String.raw;

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { qtiTransformTest } from '../src/qti-transform-test';
import { resetMissingSeedWarning } from '../src/shared/missing-seed-warning';

const order = (xmlStr: string, seed: string | number): string[] =>
  qtiTransformTest()
    .parse(xmlStr)
    .shuffleOrdering(seed)
    .items()
    .map(i => i.identifier);

const orderUnseeded = (xmlStr: string): string[] =>
  qtiTransformTest()
    .parse(xmlStr)
    .shuffleOrdering()
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
    // The subsection moves as a whole and stays a section (impl. guide §4.5.2).
    expect(flatSectionIds(doc, 'a')).toEqual(['S1', 'S2']);
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

  describe('keep-together subsections', () => {
    const SEEDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    /** The contiguous run occupied by `ids`, or null when they are not adjacent. */
    const block = (o: string[], ids: string[]): string[] | null => {
      const positions = ids.map(id => o.indexOf(id));
      const min = Math.min(...positions);
      const max = Math.max(...positions);
      return max - min === ids.length - 1 ? o.slice(min, max + 1) : null;
    };

    // No keep-together attribute: QTI 3.0 defaults it to true, so simply
    // wrapping a run of items is enough to keep them together.
    const DEFAULT_BLOCK = wrap(
      `${refs('Ia')}
       <qti-assessment-section identifier="S2">
         ${refs('Ib', 'Ic', 'Id')}
       </qti-assessment-section>
       ${refs('Ie', 'If')}`
    );

    it('keeps an attribute-less subsection together and in authored order', () => {
      for (const seed of SEEDS) {
        expect(block(order(DEFAULT_BLOCK, seed), ['Ib', 'Ic', 'Id'])).toEqual(['Ib', 'Ic', 'Id']);
      }
    });

    it('never permutes the items inside the block', () => {
      // Stronger than adjacency: the internal sequence is exactly as authored.
      const internal = SEEDS.map(seed => order(DEFAULT_BLOCK, seed).filter(id => id.match(/^I[bcd]$/)));
      for (const sequence of internal) {
        expect(sequence).toEqual(['Ib', 'Ic', 'Id']);
      }
    });

    it('moves the block to different positions across seeds', () => {
      const starts = new Set(SEEDS.map(seed => order(DEFAULT_BLOCK, seed).indexOf('Ib')));
      expect(starts.size).toBeGreaterThan(1);
    });

    it('delivers every item exactly once and keeps the subsection a section', () => {
      for (const seed of SEEDS) {
        expect([...order(DEFAULT_BLOCK, seed)].sort()).toEqual(['Ia', 'Ib', 'Ic', 'Id', 'Ie', 'If']);
      }
      expect(flatSectionIds(DEFAULT_BLOCK, 'a')).toEqual(['S1', 'S2']);
    });

    it('pins the block to its authored slot with fixed="true"', () => {
      const doc = wrap(
        `${refs('Ia')}
         <qti-assessment-section identifier="S2" fixed="true">
           ${refs('Ib', 'Ic')}
         </qti-assessment-section>
         ${refs('Id', 'Ie')}`
      );
      for (const seed of SEEDS) {
        // Authored at unit index 1, so the block occupies slots 1-2.
        expect(order(doc, seed).slice(1, 3)).toEqual(['Ib', 'Ic']);
      }
    });

    it('interleaves an invisible subsection with keep-together="false"', () => {
      const doc = wrap(
        `${refs('Ia')}
         <qti-assessment-section identifier="S2" visible="false" keep-together="false">
           ${refs('Ib', 'Ic', 'Id')}
         </qti-assessment-section>
         ${refs('Ie', 'If')}`
      );
      const splitForSomeSeed = SEEDS.some(seed => block(order(doc, seed), ['Ib', 'Ic', 'Id']) === null);
      expect(splitForSomeSeed).toBe(true);
    });

    it('keeps a visible subsection together even with keep-together="false"', () => {
      // Impl. guide §4.5.2: "If visible="true" or keep-together="true" (the default), then the
      // subsection is shuffled as a unit"; only both false merges it into the parent.
      for (const visible of ['visible="true"', '']) {
        const doc = wrap(
          `${refs('Ia')}
           <qti-assessment-section identifier="S2" ${visible} keep-together="false">
             ${refs('Ib', 'Ic', 'Id')}
           </qti-assessment-section>
           ${refs('Ie', 'If')}`
        );
        for (const seed of SEEDS) {
          expect(block(order(doc, seed), ['Ib', 'Ic', 'Id'])).toEqual(['Ib', 'Ic', 'Id']);
        }
        expect(flatSectionIds(doc, 'a')).toEqual(['S1', 'S2']);
      }
    });

    it('keeps an invisible subsection together when keep-together is not false', () => {
      const doc = wrap(
        `${refs('Ia')}
         <qti-assessment-section identifier="S2" visible="false">
           ${refs('Ib', 'Ic', 'Id')}
         </qti-assessment-section>
         ${refs('Ie', 'If')}`
      );
      for (const seed of SEEDS) {
        expect(block(order(doc, seed), ['Ib', 'Ic', 'Id'])).toEqual(['Ib', 'Ic', 'Id']);
      }
      expect(flatSectionIds(doc, 'a')).toEqual(['S1', 'S2']);
    });

    it('moves a subsection with its own subsections as one block', () => {
      const doc = wrap(
        `${refs('Ia')}
         <qti-assessment-section identifier="S2">
           ${refs('Ib')}
           <qti-assessment-section identifier="S3">
             ${refs('Ic', 'Id')}
           </qti-assessment-section>
           ${refs('Ie')}
         </qti-assessment-section>
         ${refs('If')}`
      );
      for (const seed of SEEDS) {
        const o = order(doc, seed);
        expect(block(o, ['Ib', 'Ic', 'Id', 'Ie'])).toEqual(['Ib', 'Ic', 'Id', 'Ie']);
      }
      expect(flatSectionIds(doc, 'a')).toEqual(['S1', 'S2', 'S3']);
    });

    it('keeps the subsection when the block is the only unit', () => {
      const doc = wrap(
        `<qti-assessment-section identifier="S2">
           ${refs('Ib', 'Ic')}
         </qti-assessment-section>`
      );
      expect(order(doc, 'a')).toEqual(['Ib', 'Ic']);
      expect(flatSectionIds(doc, 'a')).toEqual(['S1', 'S2']);
    });

    it('keeps trailing structural children after the reordered items', () => {
      const doc = wrap(
        `${refs('Ia', 'Ib', 'Ic', 'Id')}
         <qti-rubric-block use="instructions" view="candidate" />`
      );
      const section = qtiTransformTest()
        .parse(doc)
        .shuffleOrdering('a')
        .xmlDoc()
        .getElementsByTagName('qti-assessment-section')[0];
      const last = Array.from(section.children).at(-1);
      expect(last?.localName).toBe('qti-rubric-block');
    });

    it('pins a subsection authored first to the front of the section', () => {
      const doc = wrap(
        `<qti-assessment-section identifier="S2" fixed="true">
           ${refs('Ib', 'Ic')}
         </qti-assessment-section>
         ${refs('Ia', 'Id', 'Ie')}`
      );
      for (const seed of SEEDS) {
        expect(order(doc, seed).slice(0, 2)).toEqual(['Ib', 'Ic']);
      }
    });

    it('randomizes inside the block only when it asks to', () => {
      // The complement of the default: a subsection's own ordering rule is
      // implicitly shuffle="false", so opting in has to be what makes the
      // internal order vary.
      const optedIn = wrap(
        `<qti-assessment-section identifier="S2">
           <qti-ordering shuffle="true" />
           ${refs('Ib', 'Ic', 'Id')}
         </qti-assessment-section>
         ${refs('Ia', 'Ie')}`
      );
      const internal = new Set(
        SEEDS.map(seed =>
          order(optedIn, seed)
            .filter(id => id.match(/^I[bcd]$/))
            .join()
        )
      );
      expect(internal.size).toBeGreaterThan(1);
      // ...and the block is still contiguous however it was ordered internally.
      for (const seed of SEEDS) {
        const o = order(optedIn, seed);
        expect(block(o, ['Ib', 'Ic', 'Id'])).not.toBeNull();
      }
    });

    it('pins a fixed block to its authored child slot, not an absolute item index', () => {
      // Ordering runs over the section's children, so fixed holds the block's
      // place in that sequence. A differently-sized block moving ahead of it
      // still shifts its absolute item offset -- that is the spec behavior, not
      // a slipped pin.
      const doc = wrap(
        `${refs('Ia')}
         <qti-assessment-section identifier="SBIG">${refs('Ib', 'Ic', 'Id')}</qti-assessment-section>
         <qti-assessment-section identifier="SFIX" fixed="true">${refs('Ie', 'If')}</qti-assessment-section>
         ${refs('Ig')}`
      );
      // The three movable units -- Ia, the SBIG block and Ig -- fill the slots
      // around it, so whichever two land ahead are always whole units.
      const validPrefixes = [
        ['Ia', 'Ig'],
        ['Ia', 'Ib', 'Ic', 'Id'],
        ['Ib', 'Ic', 'Id', 'Ig']
      ].map(ids => ids.sort().join());
      const offsets = new Set<number>();

      for (const seed of SEEDS) {
        const o = order(doc, seed);
        const at = o.indexOf('Ie');
        offsets.add(at);
        expect(o[at + 1]).toBe('If');
        expect(validPrefixes).toContain(o.slice(0, at).sort().join());
      }

      // The pin holds the child slot, so the absolute item offset still moves.
      expect(offsets.size).toBeGreaterThan(1);
    });
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

describe('shuffleOrdering (a dissolved subsection)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const sessionControlOf = (doc: XMLDocument, itemRef: string): Record<string, string> => {
    const ref = Array.from(doc.getElementsByTagName('qti-assessment-item-ref')).find(
      el => el.getAttribute('identifier') === itemRef
    );
    const control = ref && Array.from(ref.children).find(el => el.localName === 'qti-item-session-control');
    return Object.fromEntries(Array.from(control?.attributes ?? []).map(a => [a.name, a.value]));
  };

  it("carries the subsection's session control to its items, theirs winning", () => {
    // The items leave the subsection, so what they inherited from it (info model §7.19) goes with them.
    const doc = qtiTransformTest()
      .parse(
        wrap(
          `${refs('Ia')}
           <qti-assessment-section identifier="S2" visible="false" keep-together="false">
             <qti-item-session-control max-attempts="3" show-feedback="true" />
             ${refs('Ib')}
             <qti-assessment-item-ref identifier="Ic" href="Ic.xml">
               <qti-item-session-control max-attempts="0" />
             </qti-assessment-item-ref>
           </qti-assessment-section>`
        )
      )
      .shuffleOrdering('a')
      .xmlDoc();
    expect(sessionControlOf(doc, 'Ib')).toEqual({ 'max-attempts': '3', 'show-feedback': 'true' });
    expect(sessionControlOf(doc, 'Ic')).toEqual({ 'max-attempts': '0', 'show-feedback': 'true' });
    expect(sessionControlOf(doc, 'Ia')).toEqual({});
  });

  it('merges a dissolved subsection inside a dissolved subsection into the parent', () => {
    const doc = wrap(
      `${refs('Ia')}
       <qti-assessment-section identifier="S2" visible="false" keep-together="false">
         ${refs('Ib')}
         <qti-assessment-section identifier="S3" visible="false" keep-together="false">
           ${refs('Ic', 'Id')}
         </qti-assessment-section>
       </qti-assessment-section>
       ${refs('Ie')}`
    );
    expect(flatSectionIds(doc, 'a')).toEqual(['S1']);
    const seeds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const adjacent = (o: string[]) => Math.abs(o.indexOf('Ic') - o.indexOf('Id')) === 1;
    expect(seeds.some(seed => !adjacent(order(doc, seed)))).toBe(true);
  });

  it('keeps a visible subsection inside a dissolved one as a block', () => {
    const doc = wrap(
      `${refs('Ia')}
       <qti-assessment-section identifier="S2" visible="false" keep-together="false">
         ${refs('Ib')}
         <qti-assessment-section identifier="S3" visible="true">
           ${refs('Ic', 'Id')}
         </qti-assessment-section>
       </qti-assessment-section>`
    );
    expect(flatSectionIds(doc, 'a')).toEqual(['S1', 'S3']);
    for (const seed of ['a', 'b', 'c', 'd']) {
      const o = order(doc, seed);
      expect(o[o.indexOf('Ic') + 1]).toBe('Id');
    }
  });

  it('warns about what the dissolved subsection held besides its items', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    order(
      wrap(
        `<qti-assessment-section identifier="S2" visible="false" keep-together="false">
           <qti-rubric-block view="candidate" />
           ${refs('Ib', 'Ic')}
         </qti-assessment-section>
         ${refs('Ia')}`
      ),
      'a'
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('qti-rubric-block'));
  });
});

describe('shuffleOrdering (an extended qti-ordering)', () => {
  it('ignores a qti-ordering with attributes it does not know', () => {
    // Impl. guide §4.5.2: a delivery system "should ignore the qti-ordering element entirely".
    const doc = xml`
      <qti-assessment-test>
        <qti-test-part identifier="P1">
          <qti-assessment-section identifier="S1">
            <qti-ordering shuffle="true" algorithm="by-difficulty" />
            ${refs('I1', 'I2', 'I3', 'I4', 'I5', 'I6')}
          </qti-assessment-section>
        </qti-test-part>
      </qti-assessment-test>`;
    for (const seed of ['a', 'b', 'c']) {
      expect(order(doc, seed)).toEqual(['I1', 'I2', 'I3', 'I4', 'I5', 'I6']);
    }
  });

  it('ignores a qti-ordering with child elements', () => {
    const doc = xml`
      <qti-assessment-test>
        <qti-test-part identifier="P1">
          <qti-assessment-section identifier="S1">
            <qti-ordering shuffle="true"><by-difficulty /></qti-ordering>
            ${refs('I1', 'I2', 'I3', 'I4', 'I5', 'I6')}
          </qti-assessment-section>
        </qti-test-part>
      </qti-assessment-test>`;
    for (const seed of ['a', 'b', 'c']) {
      expect(order(doc, seed)).toEqual(['I1', 'I2', 'I3', 'I4', 'I5', 'I6']);
    }
  });
});

describe('shuffleOrdering (no seed)', () => {
  const EIGHT = wrap(refs('I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8'));

  // The missing-seed warning fires once per session, so reset it between tests rather than
  // letting the first unseeded call in this file consume it.
  beforeEach(() => {
    resetMissingSeedWarning();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is a permutation of the items', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect([...orderUnseeded(EIGHT)].sort()).toEqual(['I1', 'I2', 'I3', 'I4', 'I5', 'I6', 'I7', 'I8']);
  });

  it('is deterministic across runs when seed is omitted', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(orderUnseeded(EIGHT)).toEqual(orderUnseeded(EIGHT));
  });

  it('warns about the deterministic fallback seed when seed is omitted', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    orderUnseeded(EIGHT);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('deterministic fallback seed'));
  });

  it('warns only once per session', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    orderUnseeded(EIGHT);
    orderUnseeded(EIGHT);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
