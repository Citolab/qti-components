import type { RandomSource } from './shuffle.js';

/** A child of a section that selection can pick: an item-ref or a subsection, which counts as one. */
export interface SelectionUnit {
  /** `required="true"`: always in the selection. */
  required: boolean;
}

/** A section's `qti-selection` (QTI 3 info model §5.129). */
export interface SelectionRule {
  /** How many units to select. */
  select: number;
  /** Whether a unit may be selected more than once (its clones). Defaults to false. */
  withReplacement?: boolean;
}

const randomValue = (source: RandomSource): number => (typeof source === 'function' ? source() : source.random());

/**
 * Which units of a section a `qti-selection` selects, as indices into `units` in authored order; a
 * unit selected more than once (`with-replacement`) has its index repeated, the clones right after
 * it. Ordering is a later, separate step (implementation guide §4.5.1: selection "should preserve
 * the original order").
 *
 * Implementation guide §4.5.1, and exactly this use of `random`, so every runtime (a .NET port too)
 * selects the same units for the same seed:
 *
 * 1. Every required unit is in.
 * 2. The rest of the first `min(select, units.length)` come from the non-required units, each with
 *    an equal chance: a partial Fisher-Yates over the non-required indices in authored order, for
 *    `i` from 0 while fewer are picked than needed, swapping position `i` with
 *    `i + floor(random() * (remaining - i))`. No draw when all of them, or none, are needed.
 * 3. With replacement and `select` above `units.length`, each unit is then in once, and each further
 *    clone is `floor(random() * units.length)`: every unit an equal chance, required or not, however
 *    often it was cloned before.
 *
 * Throws a `RangeError` for what QTI calls an error: a `select` that is not a whole number of zero or
 * more, below the number of required units, or above the number of units without replacement (or
 * above zero with no units at all).
 */
export function selectUnits(units: readonly SelectionUnit[], rule: SelectionRule, random: RandomSource): number[] {
  const { select, withReplacement = false } = rule;
  if (!Number.isInteger(select) || select < 0) {
    throw new RangeError(`qti-selection select="${select}" is not a whole number of zero or more.`);
  }
  const required = units.flatMap((unit, index) => (unit.required ? [index] : []));
  if (select < required.length) {
    throw new RangeError(
      `qti-selection select="${select}" is less than the ${required.length} required items and subsections.`
    );
  }
  if (select > units.length && (!withReplacement || units.length === 0)) {
    throw new RangeError(
      `qti-selection select="${select}" is more than the ${units.length} items and subsections, without with-replacement="true".`
    );
  }

  const optional = units.flatMap((unit, index) => (unit.required ? [] : [index]));
  const needed = Math.min(select, units.length) - required.length;
  if (needed < optional.length) {
    for (let i = 0; i < needed; i++) {
      const j = i + Math.floor(randomValue(random) * (optional.length - i));
      [optional[i], optional[j]] = [optional[j], optional[i]];
    }
  }
  const occurrences = new Array<number>(units.length).fill(0);
  for (const index of [...required, ...optional.slice(0, needed)]) occurrences[index] = 1;

  for (let clone = units.length; clone < select; clone++) {
    occurrences[Math.floor(randomValue(random) * units.length)]++;
  }

  return occurrences.flatMap((count, index) => new Array<number>(count).fill(index));
}
