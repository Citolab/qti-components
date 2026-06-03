import type { SeededRandomSource } from './prng';

export type RandomSource = SeededRandomSource | (() => number);

const randomValue = (source: RandomSource): number => (typeof source === 'function' ? source() : source.random());

/**
 * Fisher-Yates over non-fixed units only. Fixed units keep their authored slot
 * index while movable units are shuffled into the remaining slots.
 */
export function shuffleKeepingFixed<T extends { fixed: boolean }>(units: T[], random: RandomSource): T[] {
  const movable = units.filter(unit => !unit.fixed);

  for (let i = movable.length - 1; i > 0; i--) {
    const j = Math.floor(randomValue(random) * (i + 1));
    [movable[i], movable[j]] = [movable[j], movable[i]];
  }

  let movableIndex = 0;
  return units.map(unit => (unit.fixed ? unit : movable[movableIndex++]));
}
