import { describe, expect, it } from 'vitest';

import vectors from '../vectors/delivery-state.vectors.json';
import { fixedClock } from './clock';
import { createDeliveryState } from './create-delivery-state';
import { itemInstanceId, parseDeliveryState, DELIVERY_STATE_VERSION } from './delivery-state';

/* Runs in the `node` vitest project. A .NET port runs the same vectors. */
describe('createDeliveryState (test vectors)', () => {
  it.each(vectors.create)('$name', ({ options, state }) => {
    const { now, seed, order } = options as { now: number; seed: string | null; order?: string[] };
    expect(createDeliveryState({ clock: fixedClock(now), seed, order })).toEqual(state);
  });
});

describe('parseDeliveryState (test vectors)', () => {
  it.each(vectors.accepted)('reads back $name', ({ state }) => {
    expect(parseDeliveryState(state)).toEqual(state);
  });

  const errors = { TypeError, RangeError } as const;
  it.each(vectors.refused)('refuses $name', ({ state, error }) => {
    expect(() => parseDeliveryState(state)).toThrow(errors[error as keyof typeof errors]);
  });
});

describe('delivery state', () => {
  it('starts with nothing on screen, at the time of the injected clock', () => {
    const state = createDeliveryState({ clock: fixedClock(1_700_000_000_000), seed: 'seed-1' });
    expect(state.version).toBe(DELIVERY_STATE_VERSION);
    expect(state.startedAt).toBe(1_700_000_000_000);
    expect(state.current).toBeNull();
  });

  it('survives JSON, so a host or a server can store it', () => {
    const state = createDeliveryState({ clock: fixedClock(0), order: ['a', 'b', 'a'] });
    expect(parseDeliveryState(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });

  it('keys a clone of an item-ref apart from the first selection', () => {
    expect(itemInstanceId('item-3')).toBe('item-3');
    expect(itemInstanceId('item-3', 2)).toBe('item-3#2');
  });
});
