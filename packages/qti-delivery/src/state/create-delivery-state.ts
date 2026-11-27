import { DELIVERY_STATE_VERSION, itemInstanceId } from './delivery-state.js';

import type { Clock } from './clock.js';
import type { DeliveryState, ItemDeliveryState, ItemInstanceId } from './delivery-state.js';

export interface CreateDeliveryStateOptions {
  clock: Clock;
  seed?: string | null;
  /**
   * The item-ref identifiers after selection and ordering, in the order the candidate meets them.
   * An item-ref listed again is its next occurrence (`with-replacement`, roadmap 1 T4).
   */
  order?: readonly string[];
}

/**
 * A fresh delivery state: the item instances in `order`, nothing on screen, no plugin entries,
 * started now by the given clock.
 */
export function createDeliveryState({ clock, seed = null, order = [] }: CreateDeliveryStateOptions): DeliveryState {
  const occurrences = new Map<string, number>();
  const items: Record<ItemInstanceId, ItemDeliveryState> = {};
  const instances = order.map(itemRefIdentifier => {
    const occurrence = (occurrences.get(itemRefIdentifier) ?? 0) + 1;
    occurrences.set(itemRefIdentifier, occurrence);
    const id = itemInstanceId(itemRefIdentifier, occurrence);
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
