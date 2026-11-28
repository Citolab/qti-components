import { DELIVERY_STATE_VERSION, itemInstanceId, parseItemInstanceId } from './delivery-state.js';

import type { Clock } from './clock.js';
import type { DeliveryState, ItemDeliveryState, ItemInstanceId } from './delivery-state.js';

export interface CreateDeliveryStateOptions {
  clock: Clock;
  seed?: string | null;
  /**
   * The items after selection and ordering, in the order the candidate meets them: the rendered
   * test's item-ref identifiers, where a `with-replacement` clone is its instance id (`item-3#2`,
   * roadmap 1 T4) and keeps that occurrence wherever ordering put it. An item-ref listed again
   * without a suffix is its next free occurrence.
   */
  order?: readonly string[];
}

/**
 * A fresh delivery state: the item instances in `order`, nothing on screen, no plugin entries,
 * started now by the given clock.
 */
export function createDeliveryState({ clock, seed = null, order = [] }: CreateDeliveryStateOptions): DeliveryState {
  const parsed = order.map(parseItemInstanceId);
  // Occurrences the order names itself, so a bare repeat never takes a clone's number.
  const taken = new Set(
    parsed.filter(p => p.occurrence > 1).map(p => itemInstanceId(p.itemRefIdentifier, p.occurrence))
  );
  const items: Record<ItemInstanceId, ItemDeliveryState> = {};
  const instances = parsed.map(({ itemRefIdentifier, occurrence }) => {
    let id = itemInstanceId(itemRefIdentifier, occurrence);
    if (occurrence === 1) {
      while (Object.hasOwn(items, id) || taken.has(id)) id = itemInstanceId(itemRefIdentifier, ++occurrence);
    } else if (Object.hasOwn(items, id)) {
      throw new RangeError(`The order lists the item instance ${id} twice.`);
    }
    items[id] = { itemRefIdentifier, occurrence };
    return id;
  });
  return {
    version: DELIVERY_STATE_VERSION,
    seed,
    startedAt: clock.now(),
    current: null,
    order: instances,
    plugins: {},
    items
  };
}
