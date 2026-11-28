import { describe, expect, it } from 'vitest';

import vectors from '../vectors/delivery-state.vectors.json';
import { fixedClock } from './clock';
import { createDeliveryState } from './create-delivery-state';
import { itemInstanceId, parseDeliveryState, parseItemInstanceId, DELIVERY_STATE_VERSION } from './delivery-state';

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

  it('reads an instance id back into its item-ref and occurrence', () => {
    expect(parseItemInstanceId('item-3')).toEqual({ itemRefIdentifier: 'item-3', occurrence: 1 });
    expect(parseItemInstanceId('item-3#2')).toEqual({ itemRefIdentifier: 'item-3', occurrence: 2 });
    expect(parseItemInstanceId('item-3#12')).toEqual({ itemRefIdentifier: 'item-3', occurrence: 12 });
    // itemInstanceId never writes #1 or #0, so they are not instance suffixes.
    expect(parseItemInstanceId('item-3#1')).toEqual({ itemRefIdentifier: 'item-3#1', occurrence: 1 });
  });

  it('refuses an order that lists one instance twice', () => {
    expect(() => createDeliveryState({ clock: fixedClock(0), order: ['a#2', 'a', 'a#2'] })).toThrow(RangeError);
  });
});
