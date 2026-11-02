import { describe, expect, it } from 'vitest';

import vectors from '../vectors/random.vectors.json';
import { createSeededRandom, SeededRandom } from './seeded-random';
import { shuffleKeepingFixed } from './shuffle';

/*
 * The vectors were captured from qti-transformers before the code moved here. A change to the
 * generator or the shuffle that alters any value changes the item order of every resumed session,
 * so these must stay byte-for-byte; a .NET port runs the same file.
 */
describe('seeded randomness (test vectors)', () => {
  it.each(vectors.seededRandom)('seed $seed gives the recorded sequence', ({ seed, values }) => {
    const random = createSeededRandom(seed);
    expect(values.map(() => random.random())).toEqual(values);
  });

  it.each(vectors.fixedByte)('fixed byte $byte gives the recorded sequence', ({ byte, values }) => {
    const random = SeededRandom.fromFixed(byte);
    expect(values.map(() => random.random())).toEqual(values);
  });

  it.each(vectors.shuffleKeepingFixed)(
    'seed $seed shuffles $fixed into the recorded order',
    ({ seed, fixed, order }) => {
      const units = fixed.map((isFixed, index) => ({ index, fixed: isFixed }));
      const shuffled = shuffleKeepingFixed(units, createSeededRandom(seed)).map(unit => unit.index);
      expect(shuffled).toEqual(order);
      fixed.forEach((isFixed, index) => isFixed && expect(shuffled[index]).toBe(index));
    }
  );
});
