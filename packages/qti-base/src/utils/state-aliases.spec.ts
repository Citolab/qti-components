import { describe, expect, it } from 'vitest';

import { hasState, setState, STATE_ALIASES } from './state-aliases';

describe('setState: the contract name and its aliases', () => {
  it('sets the new name and every old name, and clears them together', () => {
    const states = new Set<string>();
    setState(states, 'lifted', true);
    expect([...states]).toEqual(['lifted', 'dragging']);
    setState(states, 'lifted', false);
    expect(states.size).toBe(0);
  });

  it('takes an explicit old-name list where the alias depends on the element', () => {
    const states = new Set<string>();
    setState(states, 'drag-active', true, ['dragzone-active', 'dragzone-enabled']);
    expect([...states]).toEqual(['drag-active', 'dragzone-active', 'dragzone-enabled']);
  });

  it('sets only the name when it has no alias', () => {
    const states = new Set<string>();
    setState(states, 'filled', true);
    expect([...states]).toEqual(['filled']);
  });

  it('does nothing without a state set', () => {
    expect(() => setState(undefined, 'lifted', true)).not.toThrow();
    expect(hasState(null, 'lifted')).toBe(false);
  });

  it('hasState reads either spelling', () => {
    const states = new Set<string>(['candidate-partially-correct']);
    expect(hasState(states, 'candidate-partial')).toBe(true);
    expect(hasState(states, 'lifted')).toBe(false);
  });

  it('every alias is a one-way rename: no old name is also a new name', () => {
    const newNames = new Set(Object.keys(STATE_ALIASES));
    for (const olds of Object.values(STATE_ALIASES)) {
      for (const old of olds) expect(newNames.has(old), old).toBe(false);
    }
  });
});
