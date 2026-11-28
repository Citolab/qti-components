import { describe, expect, it } from 'vitest';

import vectors from '../vectors/item-rules.vectors.json';
import { ITEM_LIFECYCLE_STATES, itemLifecycleGuards, transition } from './item-lifecycle';
import { itemRules, navigationRules } from './item-rules';

import type { ItemRules, ItemRulesInput, NavigationRulesInput } from './item-rules';

/** A case's input over its base; the nested objects merged field by field, as the vectors file says. */
function merged<T extends object>(base: T, input: object): T {
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(input)) {
    const baseValue = result[key];
    result[key] =
      value !== null && typeof value === 'object' && typeof baseValue === 'object' ? { ...baseValue, ...value } : value;
  }
  return result as T;
}

const itemInput = (input: object) => merged(vectors.items.base as ItemRulesInput, input);

const ANSWERS: readonly (keyof ItemRules)[] = [
  'attemptsLeft',
  'attemptsUsed',
  'interactive',
  'done',
  'mayEndAttempt',
  'maySubmit',
  'maySkip',
  'mayShowFeedback',
  'mayBeginReview',
  'mayBeginSolution'
];

/* Runs in the `node` vitest project. A .NET port runs the same vectors. */
describe('itemRules (test vectors)', () => {
  it.each(vectors.items.cases)('$name', ({ input, expect: expected }) => {
    const rules = itemRules(itemInput(input));
    for (const answer of Object.keys(expected)) expect(ANSWERS).toContain(answer);
    expect(rules).toMatchObject(expected);
  });
});

describe('navigationRules (test vectors)', () => {
  it.each(vectors.navigation.cases)('$name', ({ input, expect: expected }) => {
    expect(navigationRules(merged(vectors.navigation.base as NavigationRulesInput, input))).toMatchObject(expected);
  });
});

describe('itemRules', () => {
  it('answers exactly its documented questions', () => {
    expect(Object.keys(itemRules(itemInput({}))).sort()).toEqual([...ANSWERS].sort());
  });

  it('agrees with the lifecycle table in every state', () => {
    for (const state of ITEM_LIFECYCLE_STATES) {
      for (const flags of [
        {},
        { sessionControl: { showSolution: true } },
        { sessionControl: { allowReview: false } },
        { numAttempts: 1 },
        { submissionMode: 'simultaneous' }
      ]) {
        const input = itemInput({ ...flags, state });
        const guards = itemLifecycleGuards(input);
        const rules = itemRules(input);
        expect(rules.mayBeginReview, `${state} review`).toBe(transition(state, 'beginReview', guards) !== null);
        expect(rules.mayBeginSolution, `${state} solution`).toBe(transition(state, 'beginSolution', guards) !== null);
        if (rules.mayEndAttempt) expect(transition(state, 'endAttempt', guards), `${state} end`).not.toBeNull();
        expect(rules.attemptsLeft).toBe(guards.attemptsLeft);
        expect(rules.attemptsUsed).toBe(!guards.attemptsLeft);
      }
    }
  });
});
