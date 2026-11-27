import { describe, expect, it } from 'vitest';

import vectors from '../vectors/item-lifecycle.vectors.json';
import {
  ITEM_LIFECYCLE,
  ITEM_LIFECYCLE_EVENTS,
  ITEM_LIFECYCLE_GUARDS,
  ITEM_LIFECYCLE_STATES,
  itemLifecycleGuards,
  transition
} from './item-lifecycle';

import type {
  ItemLifecycleEvent,
  ItemLifecycleGuard,
  ItemLifecycleGuards,
  ItemLifecycleInput,
  ItemLifecycleState
} from './item-lifecycle';

/** The table's own source, for its documented diagram. */
const [source] = Object.values(
  import.meta.glob<string>('./item-lifecycle.ts', { query: '?raw', import: 'default', eager: true })
);

/* Runs in the `node` vitest project. A .NET port runs the same vectors. */
describe('transition (test vectors)', () => {
  it.each(vectors.transitions)('$name', ({ from, event, guards, to }) => {
    expect(transition(from as ItemLifecycleState, event as ItemLifecycleEvent, guards as ItemLifecycleGuards)).toBe(to);
  });
});

describe('itemLifecycleGuards (test vectors)', () => {
  it.each(vectors.guards)('$name', ({ input, guards }) => {
    expect(itemLifecycleGuards(input as ItemLifecycleInput)).toEqual(guards);
  });
});

/** Every combination of guard values, so no branch of the table goes unvisited. */
const everyGuardCombination = (): ItemLifecycleGuards[] =>
  Array.from({ length: 2 ** ITEM_LIFECYCLE_GUARDS.length }, (_, bits) =>
    Object.fromEntries(ITEM_LIFECYCLE_GUARDS.map((guard, i) => [guard, Boolean(bits & (1 << i))]))
  ) as unknown as ItemLifecycleGuards[];

/**
 * The transitions QTI 3 info model §2.2.1 (Figure 2.1) gives an item session, as this delivery maps
 * them to its events: from, event, to. Written out by hand, apart from the table, so a transition
 * added to or dropped from the table fails here.
 */
const EXPECTED: readonly (readonly [ItemLifecycleState, ItemLifecycleEvent, ItemLifecycleState])[] = [
  ['initial', 'beginAttempt', 'interacting'],
  ['initial', 'endItemSession', 'closed'],
  ['interacting', 'endAttempt', 'interacting'],
  ['interacting', 'endAttempt', 'modalFeedback'],
  ['interacting', 'endAttempt', 'closed'],
  ['interacting', 'endCandidateSession', 'suspended'],
  ['interacting', 'endItemSession', 'closed'],
  ['modalFeedback', 'beginAttempt', 'interacting'],
  ['modalFeedback', 'endCandidateSession', 'suspended'],
  ['modalFeedback', 'endItemSession', 'closed'],
  ['suspended', 'beginCandidateSession', 'interacting'],
  ['suspended', 'endItemSession', 'closed'],
  ['closed', 'beginReview', 'review'],
  ['closed', 'beginSolution', 'solution'],
  ['review', 'endReview', 'closed'],
  ['solution', 'endSolution', 'closed']
];

const key = (from: string, event: string, to: string) => `${from} --${event}--> ${to}`;

describe('the item session lifecycle', () => {
  it('walks every (state, event) pair under every guard combination: only the expected transitions happen', () => {
    const reached = new Set<string>();
    for (const from of ITEM_LIFECYCLE_STATES) {
      for (const event of ITEM_LIFECYCLE_EVENTS) {
        for (const guards of everyGuardCombination()) {
          const to = transition(from, event, guards);
          if (to !== null) reached.add(key(from, event, to));
        }
      }
    }
    expect([...reached].sort()).toEqual(EXPECTED.map(([from, event, to]) => key(from, event, to)).sort());
  });

  it('refuses every pair the table does not list, whatever the guards say', () => {
    const allTrue = Object.fromEntries(ITEM_LIFECYCLE_GUARDS.map(guard => [guard, true])) as ItemLifecycleGuards;
    const listed = new Set(EXPECTED.map(([from, event]) => `${from} ${event}`));
    for (const from of ITEM_LIFECYCLE_STATES) {
      for (const event of ITEM_LIFECYCLE_EVENTS) {
        if (!listed.has(`${from} ${event}`)) expect(transition(from, event, allTrue), `${from} ${event}`).toBeNull();
      }
    }
  });

  it('names only known states, events and guards in its table', () => {
    for (const [from, events] of Object.entries(ITEM_LIFECYCLE)) {
      expect(ITEM_LIFECYCLE_STATES).toContain(from);
      for (const [event, target] of Object.entries(events)) {
        expect(ITEM_LIFECYCLE_EVENTS).toContain(event);
        const branches = typeof target === 'string' ? [{ to: target }] : target;
        for (const branch of branches) {
          expect(ITEM_LIFECYCLE_STATES).toContain(branch.to);
          const guards: ItemLifecycleGuard[] = [...(branch.when ?? []), ...(branch.unless ?? [])];
          for (const guard of guards) expect(ITEM_LIFECYCLE_GUARDS).toContain(guard);
        }
      }
    }
  });

  it('matches the diagram in its documentation', () => {
    const diagram = /```mermaid\n([\s\S]*?)```/.exec(source)?.[1] ?? '';
    const drawn = diagram
      .split('\n')
      .map(line => /^\s*\*?\s*(\w+) --> (\w+): (\w+)/.exec(line))
      .filter((match): match is RegExpExecArray => match !== null)
      .map(([, from, to, event]) => key(from, event, to));
    expect(drawn.sort()).toEqual(EXPECTED.map(([from, event, to]) => key(from, event, to)).sort());
  });
});
