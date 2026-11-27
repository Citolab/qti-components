import { describe, expect, it } from 'vitest';

import vectors from '../vectors/selection.vectors.json';
import { createSeededRandom } from './seeded-random';
import { selectUnits } from './selection';

const units = (required: boolean[]) => required.map(isRequired => ({ required: isRequired }));

/** How often each index occurs in a selection. */
const counts = (selected: number[], size: number) => {
  const tally = new Array<number>(size).fill(0);
  for (const index of selected) tally[index]++;
  return tally;
};

/*
 * The vectors are what a resumed session depends on: a change that alters any of them selects other
 * items for every stored seed, so they stay byte-for-byte, and a .NET port runs the same file.
 */
describe('selectUnits (test vectors)', () => {
  it.each(vectors.selectUnits)(
    'seed $seed selects $select of $required (with-replacement $withReplacement)',
    ({ seed, required, select, withReplacement, selected }) => {
      expect(selectUnits(units(required), { select, withReplacement }, createSeededRandom(seed))).toEqual(selected);
    }
  );

  it.each(vectors.invalid)(
    'refuses to select $select of $required (with-replacement $withReplacement)',
    ({ required, select, withReplacement }) => {
      expect(() => selectUnits(units(required), { select, withReplacement }, createSeededRandom('x'))).toThrow(
        RangeError
      );
    }
  );
});

describe('selectUnits (implementation guide §4.5.1)', () => {
  const SEEDS = Array.from({ length: 40 }, (_, i) => `seed-${i}`);

  it('selects `select` units, once each, in authored order', () => {
    for (const seed of SEEDS) {
      const selected = selectUnits(units([false, false, false, false, false]), { select: 3 }, createSeededRandom(seed));
      expect(selected).toHaveLength(3);
      expect(selected).toEqual([...selected].sort((a, b) => a - b));
      expect(new Set(selected).size).toBe(3);
    }
  });

  it('always includes the required units', () => {
    for (const seed of SEEDS) {
      const selected = selectUnits(units([true, false, false]), { select: 2 }, createSeededRandom(seed));
      expect(selected[0]).toBe(0);
      expect(selected).toHaveLength(2);
    }
  });

  it('gives the non-required units an equal chance', () => {
    const tally = new Array<number>(4).fill(0);
    for (let i = 0; i < 4000; i++) {
      for (const index of selectUnits(units([false, false, false, false]), { select: 1 }, createSeededRandom(i))) {
        tally[index]++;
      }
    }
    for (const count of tally) expect(count).toBeGreaterThan(900);
  });

  it('selects nothing for select="0"', () => {
    expect(selectUnits(units([false, false]), { select: 0 }, createSeededRandom('x'))).toEqual([]);
  });

  it('selects everything when select is the number of units, without drawing', () => {
    let draws = 0;
    const random = () => (draws++, 0.5);
    expect(selectUnits(units([false, true, false]), { select: 3 }, random)).toEqual([0, 1, 2]);
    expect(draws).toBe(0);
  });

  it('with replacement, clones nothing until every unit is in once', () => {
    for (const seed of SEEDS) {
      const rule = { select: 3, withReplacement: true };
      expect(selectUnits(units([false, false, false]), rule, createSeededRandom(seed))).toEqual([0, 1, 2]);
    }
  });

  it('with replacement, clones beyond the number of units, each clone next to its original', () => {
    for (const seed of SEEDS) {
      const rule = { select: 7, withReplacement: true };
      const selected = selectUnits(units([true, false, false]), rule, createSeededRandom(seed));
      expect(selected).toHaveLength(7);
      expect(selected).toEqual([...selected].sort((a, b) => a - b));
      expect(counts(selected, 3).every(count => count >= 1)).toBe(true);
    }
  });

  it('with replacement, clones every unit with an equal chance, required or not', () => {
    const tally = new Array<number>(3).fill(0);
    for (let i = 0; i < 3000; i++) {
      const selected = selectUnits(
        units([true, false, false]),
        { select: 4, withReplacement: true },
        createSeededRandom(i)
      );
      counts(selected, 3).forEach((count, index) => (tally[index] += count - 1));
    }
    for (const clones of tally) expect(clones).toBeGreaterThan(850);
  });

  it('with replacement, selects fewer than all as it would without', () => {
    for (const seed of SEEDS) {
      const required = units([true, false, false, false]);
      expect(selectUnits(required, { select: 2, withReplacement: true }, createSeededRandom(seed))).toEqual(
        selectUnits(required, { select: 2 }, createSeededRandom(seed))
      );
    }
  });

  it('refuses a select below the number of required units', () => {
    expect(() => selectUnits(units([true, true, false]), { select: 1 }, createSeededRandom('x'))).toThrow(/required/);
  });

  it('refuses a select above the number of units without replacement', () => {
    expect(() => selectUnits(units([false, false]), { select: 3 }, createSeededRandom('x'))).toThrow(
      /with-replacement/
    );
  });

  it('refuses a negative or fractional select', () => {
    expect(() => selectUnits(units([false]), { select: -1 }, createSeededRandom('x'))).toThrow(RangeError);
    expect(() => selectUnits(units([false, false]), { select: 1.5 }, createSeededRandom('x'))).toThrow(RangeError);
  });
});
