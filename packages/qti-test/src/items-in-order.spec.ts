import { describe, expect, it } from 'vitest';

import { itemsInOrder } from './items-in-order';

import type { ComputedContext } from '@qti-components/base';

type Part = ComputedContext['testParts'][number];

const item = (identifier: string) => ({ identifier, categories: [], href: '', variables: [] }) as never;

/** Section 1 holds subsection 1-A, item 4 and subsection 1-B (the suite's Elective T7 sample). */
const part = (itemOrder?: string[]): Part =>
  ({
    identifier: 'P',
    navigationMode: 'linear',
    submissionMode: 'individual',
    itemOrder,
    sections: [
      { identifier: 'S1', title: 'S1', items: [item('4')] },
      { identifier: 'S1-A', title: 'S1-A', items: [item('1-A'), item('2-A')] },
      { identifier: 'S1-B', title: 'S1-B', items: [item('5-B')] },
      { identifier: 'S2', title: 'S2', items: [item('8')] }
    ]
  }) as Part;

describe('itemsInOrder', () => {
  it('gives the items in document order, not in the depth-first order of the sections', () => {
    expect(itemsInOrder(part(['1-A', '2-A', '4', '5-B', '8'])).map(i => i.identifier)).toEqual([
      '1-A',
      '2-A',
      '4',
      '5-B',
      '8'
    ]);
  });

  it('falls back to the sections as listed for a part without itemOrder', () => {
    expect(itemsInOrder(part()).map(i => i.identifier)).toEqual(['4', '1-A', '2-A', '5-B', '8']);
  });
});
