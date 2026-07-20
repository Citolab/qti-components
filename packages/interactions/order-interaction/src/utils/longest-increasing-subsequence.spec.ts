import { describe, expect, it } from 'vitest';

import {
  findCorrectlyPlacedIdentifiers,
  findLongestIncreasingSubsequenceIndices
} from './longest-increasing-subsequence';

const correctOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

describe('findCorrectlyPlacedIdentifiers', () => {
  it('identity order marks all as correctly placed', () => {
    const result = findCorrectlyPlacedIdentifiers(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], correctOrder);
    expect(result).toEqual(new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']));
  });

  it('example 2: single element moved to the end excludes exactly that element', () => {
    const result = findCorrectlyPlacedIdentifiers(['A', 'B', 'C', 'E', 'F', 'G', 'H', 'D'], correctOrder);
    expect(result).toEqual(new Set(['A', 'B', 'C', 'E', 'F', 'G', 'H']));
  });

  it('example 3: tiebreaker keeps the leftmost-first LIS', () => {
    const result = findCorrectlyPlacedIdentifiers(['A', 'B', 'C', 'E', 'D', 'F', 'G', 'H'], correctOrder);
    expect(result).toEqual(new Set(['A', 'B', 'C', 'E', 'F', 'G', 'H']));
  });

  it('example 4: leading block moved to the front excludes exactly that block', () => {
    const result = findCorrectlyPlacedIdentifiers(['F', 'G', 'H', 'A', 'B', 'C', 'D', 'E'], correctOrder);
    expect(result).toEqual(new Set(['A', 'B', 'C', 'D', 'E']));
  });

  it('example 5: single element moved near the front excludes exactly that element', () => {
    const result = findCorrectlyPlacedIdentifiers(['A', 'H', 'B', 'C', 'D', 'E', 'F', 'G'], correctOrder);
    expect(result).toEqual(new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G']));
  });

  it('example 6: fully reversed order keeps only the deterministic first element', () => {
    const result = findCorrectlyPlacedIdentifiers(['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'], correctOrder);
    expect(result).toEqual(new Set(['H']));
  });

  it('min length 3: single element out of place at the start', () => {
    const result = findCorrectlyPlacedIdentifiers(['C', 'A', 'B'], ['A', 'B', 'C']);
    expect(result).toEqual(new Set(['A', 'B']));
  });

  it('min length 3: identity order', () => {
    const result = findCorrectlyPlacedIdentifiers(['A', 'B', 'C'], ['A', 'B', 'C']);
    expect(result).toEqual(new Set(['A', 'B', 'C']));
  });

  it('min length 3: tiebreak keeps leftmost-first LIS', () => {
    const result = findCorrectlyPlacedIdentifiers(['B', 'A', 'C'], ['A', 'B', 'C']);
    expect(result).toEqual(new Set(['B', 'C']));
  });

  it('max length 20: adjacent swap excludes exactly the two swapped items', () => {
    const identifiers = Array.from({ length: 20 }, (_, index) => `item${String(index + 1).padStart(2, '0')}`);
    const candidateOrder = [...identifiers];
    [candidateOrder[9], candidateOrder[10]] = [candidateOrder[10], candidateOrder[9]];

    const result = findCorrectlyPlacedIdentifiers(candidateOrder, identifiers);
    expect(result.size).toBe(19);
    expect(result.has('item10')).toBe(false);
  });

  it('max length 20: shuffled order matches the known LIS', () => {
    const identifiers = Array.from({ length: 20 }, (_, index) => `item${String(index + 1).padStart(2, '0')}`);
    // ranks: item01..item05 in order, then item20 (rank 19), then item06..item19 in order
    const candidateOrder = [
      'item01',
      'item02',
      'item03',
      'item04',
      'item05',
      'item20',
      'item06',
      'item07',
      'item08',
      'item09',
      'item10',
      'item11',
      'item12',
      'item13',
      'item14',
      'item15',
      'item16',
      'item17',
      'item18',
      'item19'
    ];

    const result = findCorrectlyPlacedIdentifiers(candidateOrder, identifiers);
    expect(result).toEqual(
      new Set([
        'item01',
        'item02',
        'item03',
        'item04',
        'item05',
        'item06',
        'item07',
        'item08',
        'item09',
        'item10',
        'item11',
        'item12',
        'item13',
        'item14',
        'item15',
        'item16',
        'item17',
        'item18',
        'item19'
      ])
    );
  });

  it('foreign identifier is excluded from the result and does not affect the others', () => {
    const result = findCorrectlyPlacedIdentifiers(['A', 'B', 'X', 'C', 'D'], correctOrder);
    expect(result).toEqual(new Set(['A', 'B', 'C', 'D']));
    expect(result.has('X')).toBe(false);
  });

  it('empty candidate order returns an empty set', () => {
    const result = findCorrectlyPlacedIdentifiers([], correctOrder);
    expect(result).toEqual(new Set());
  });

  it('single element candidate order returns that element', () => {
    const result = findCorrectlyPlacedIdentifiers(['C'], correctOrder);
    expect(result).toEqual(new Set(['C']));
  });

  it('partial placement in correct relative order marks all as correctly placed', () => {
    const result = findCorrectlyPlacedIdentifiers(['B', 'D', 'F'], correctOrder);
    expect(result).toEqual(new Set(['B', 'D', 'F']));
  });
});

describe('findLongestIncreasingSubsequenceIndices', () => {
  it('already increasing sequence keeps every index', () => {
    const result = findLongestIncreasingSubsequenceIndices([1, 2, 3]);
    expect(result).toEqual(new Set([0, 1, 2]));
  });

  it('fully decreasing sequence keeps only the first index', () => {
    const result = findLongestIncreasingSubsequenceIndices([3, 2, 1]);
    expect(result).toEqual(new Set([0]));
  });

  it('tie between two subsequences of equal length keeps the leftmost-first one', () => {
    const result = findLongestIncreasingSubsequenceIndices([0, 2, 1, 3]);
    expect(result).toEqual(new Set([0, 1, 3]));
  });
});
