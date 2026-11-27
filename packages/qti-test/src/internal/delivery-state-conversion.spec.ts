import { describe, expect, it } from 'vitest';

import { fixedClock, parseDeliveryState } from '@qti-components/delivery';

import { deliveryStateFromQtiTestState, qtiTestStateFromDeliveryState } from './delivery-state-conversion';

import type { QtiTestState } from '../types/qti-test-state';

const ORDER = ['item-2', 'item-1', 'item-3'];
const inputs = { order: ORDER, seed: 'seed-1', clock: fixedClock(1_700_000_000_000) };

const stored: QtiTestState = {
  version: 1,
  test: {
    items: [
      { identifier: 'item-1', variables: [{ identifier: 'RESPONSE', type: 'response', value: ['A', 'B'] }] },
      { identifier: 'item-2', variables: [{ identifier: 'SCORE', value: '1' }], state: { RESPONSE: '{"pci":1}' } }
    ],
    outcomes: [{ identifier: 'TOTAL', value: '3' }]
  },
  session: { navItemRefId: 'item-1', plugins: { bookmarks: ['item-3'] } }
};

describe('deliveryStateFromQtiTestState', () => {
  it('takes the order, seed and start from the inputs, and the item on screen and plugins from the state', () => {
    expect(deliveryStateFromQtiTestState(stored, inputs)).toEqual({
      version: 1,
      seed: 'seed-1',
      startedAt: 1_700_000_000_000,
      current: 'item-1',
      order: ORDER,
      plugins: { bookmarks: ['item-3'] },
      items: {
        'item-2': { itemRefIdentifier: 'item-2', occurrence: 1 },
        'item-1': { itemRefIdentifier: 'item-1', occurrence: 1 },
        'item-3': { itemRefIdentifier: 'item-3', occurrence: 1 }
      }
    });
  });

  it('gives a state a later release reads back', () => {
    const delivery = deliveryStateFromQtiTestState(stored, inputs);
    expect(parseDeliveryState(JSON.parse(JSON.stringify(delivery)))).toEqual(delivery);
  });

  it('keeps no position for an item the order does not have', () => {
    const state = { ...stored, session: { navItemRefId: 'gone' } };
    expect(deliveryStateFromQtiTestState(state, inputs).current).toBeNull();
  });

  it('keeps no position for a section only (navigate="section"): lossy until DeliveryState is the source', () => {
    const state = { ...stored, session: { navPartId: 'P1', navSectionId: 'S1' } };
    expect(deliveryStateFromQtiTestState(state, inputs).current).toBeNull();
  });

  it('starts with no plugin entries when the state has none', () => {
    expect(deliveryStateFromQtiTestState({ ...stored, session: {} }, inputs).plugins).toEqual({});
  });
});

describe('qtiTestStateFromDeliveryState', () => {
  it('round-trips the position, the plugin entries and the values', () => {
    const delivery = deliveryStateFromQtiTestState(stored, inputs);
    expect(qtiTestStateFromDeliveryState(delivery, stored.test)).toEqual(stored);
  });

  it('writes no position before the first navigation and no empty plugins', () => {
    const delivery = deliveryStateFromQtiTestState({ ...stored, session: {} }, inputs);
    expect(qtiTestStateFromDeliveryState(delivery, stored.test).session).toEqual({});
  });

  it('copies the values, so the result does not share arrays with its input', () => {
    const result = qtiTestStateFromDeliveryState(deliveryStateFromQtiTestState(stored, inputs), stored.test);
    (result.test.items[0].variables[0].value as string[]).push('C');
    expect(stored.test.items[0].variables[0].value).toEqual(['A', 'B']);
  });
});
