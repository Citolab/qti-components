import { DELIVERY_STATE_VERSION } from './delivery-state.js';

import type { Clock } from './clock.js';
import type { DeliveryState } from './delivery-state.js';

export interface CreateDeliveryStateOptions {
  clock: Clock;
  seed?: string | null;
}

/** A fresh delivery state: nothing selected, nothing on screen, started now by the given clock. */
export function createDeliveryState({ clock, seed = null }: CreateDeliveryStateOptions): DeliveryState {
  return { version: DELIVERY_STATE_VERSION, seed, startedAt: clock.now(), current: null, items: {} };
}
