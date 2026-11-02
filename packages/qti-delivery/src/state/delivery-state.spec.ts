import { describe, expect, it } from 'vitest';

import { fixedClock } from './clock';
import { createDeliveryState } from './create-delivery-state';
import { itemInstanceId, parseDeliveryState, DELIVERY_STATE_VERSION } from './delivery-state';

describe('delivery state', () => {
  it('starts empty, at the time of the injected clock', () => {
    expect(createDeliveryState({ clock: fixedClock(1_700_000_000_000), seed: 'seed-1' })).toEqual({
      version: DELIVERY_STATE_VERSION,
      seed: 'seed-1',
      startedAt: 1_700_000_000_000,
      current: null,
      items: {}
    });
  });

  it('survives JSON, so a host or a server can store it', () => {
    const state = createDeliveryState({ clock: fixedClock(0) });
    expect(parseDeliveryState(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });

  it('refuses a state of another version instead of guessing', () => {
    expect(() => parseDeliveryState({ version: 99 })).toThrow(RangeError);
    expect(() => parseDeliveryState(null)).toThrow(TypeError);
  });

  it('keys a clone of an item-ref apart from the first selection', () => {
    expect(itemInstanceId('item-3')).toBe('item-3');
    expect(itemInstanceId('item-3', 2)).toBe('item-3#2');
  });
});
