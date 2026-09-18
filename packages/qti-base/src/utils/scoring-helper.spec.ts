import { describe, expect, it } from 'vitest';

import { ScoringHelper } from './scoring-helper';

/**
 * `compareSingleValues` is the single place every operator that compares two
 * values goes through — `qti-match`, `qti-equal`, `qti-contains`, `qti-member`.
 * A mistake here is a mistake in all of them at once.
 */
describe('ScoringHelper.compareSingleValues', () => {
  describe('pair', () => {
    it('ignores the order within the pair', () => {
      expect(ScoringHelper.compareSingleValues('A B', 'B A', 'pair')).toBe(true);
    });

    it('still distinguishes different identifiers', () => {
      expect(ScoringHelper.compareSingleValues('A B', 'A C', 'pair')).toBe(false);
    });
  });

  describe('directedPair', () => {
    it('matches an identical pair', () => {
      expect(ScoringHelper.compareSingleValues('A B', 'A B', 'directedPair')).toBe(true);
    });

    // Both operands used to be sorted on the way in, which made direction
    // irrelevant — the wrong way round scored as correct.
    it('respects direction', () => {
      expect(ScoringHelper.compareSingleValues('A B', 'B A', 'directedPair')).toBe(false);
    });
  });

  describe('numbers', () => {
    it('compares integers numerically rather than as text', () => {
      expect(ScoringHelper.compareSingleValues('02', '2', 'integer')).toBe(true);
    });

    it('compares floats numerically', () => {
      expect(ScoringHelper.compareSingleValues('1.50', '1.5', 'float')).toBe(true);
    });
  });

  describe('text', () => {
    it('compares identifiers exactly', () => {
      expect(ScoringHelper.compareSingleValues('A', 'A', 'identifier')).toBe(true);
      expect(ScoringHelper.compareSingleValues('A', 'a', 'identifier')).toBe(false);
    });
  });
});
