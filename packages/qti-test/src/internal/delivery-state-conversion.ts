import { createDeliveryState, itemInstanceId } from '@qti-components/delivery';

import { QTI_TEST_STATE_VERSION } from '../types/qti-test-state';

import type { Clock, DeliveryState } from '@qti-components/delivery';
import type { QtiTestState } from '../types/qti-test-state';

/**
 * Converts between `QtiTestState`, the host's persistence format, and `DeliveryState`, the one source
 * of truth to come (`plans/delivery-state.md`). Roadmap 1 T1e: pure functions, called by nothing at
 * runtime yet; `qti-test` keeps its state in `testContext` and `sessionContext` until T2 and T3 derive
 * from a `DeliveryState`.
 *
 * Lossy on purpose, until the fields exist on both sides:
 * - the variables are not in `DeliveryState` until T8, so the way back takes them as an input;
 * - `DeliveryState.current` is an item instance, so a position of only a section (`navigate="section"`)
 *   or a part (`navSectionId`, `navPartId`) is not kept (decided 2026-11-27);
 * - a version 1 `QtiTestState` has no seed, order or start time, so the caller passes them in.
 *
 * @internal
 */

export interface DeliveryStateInputs {
  /**
   * The item-ref identifiers in the order the candidate meets them: the rendered test's, which is
   * already selected and shuffled with the seed the host passed; a `with-replacement` clone is its
   * instance id (`item-1#2`).
   */
  order: readonly string[];
  /** The seed actually used for that order. */
  seed: string | null;
  /** When the delivery starts; a version 1 state does not say when the test started. */
  clock: Clock;
}

/**
 * A `DeliveryState` from a stored `QtiTestState`: the order, the item on screen and the plugin
 * entries. An item on screen that the order does not have, and a position of only a section or a
 * part, give `current: null`.
 *
 * @internal
 */
export function deliveryStateFromQtiTestState(state: QtiTestState, inputs: DeliveryStateInputs): DeliveryState {
  const delivery = createDeliveryState(inputs);
  const onScreen = state.session.navItemRefId ? itemInstanceId(state.session.navItemRefId) : null;
  return {
    ...delivery,
    current: onScreen && Object.hasOwn(delivery.items, onScreen) ? onScreen : null,
    plugins: { ...(state.session.plugins ?? {}) }
  };
}

/**
 * A `QtiTestState` from a `DeliveryState`: the item on screen and the plugin entries, with the
 * variables from `test` (the live contexts' values, as `qtiTest.state` reads them). The `test` input
 * goes when the variables move into `DeliveryState` (T8).
 *
 * @internal
 */
export function qtiTestStateFromDeliveryState(delivery: DeliveryState, test: QtiTestState['test']): QtiTestState {
  return {
    version: QTI_TEST_STATE_VERSION,
    test: {
      items: test.items.map(item => ({
        ...item,
        variables: item.variables.map(v => ({ ...v, value: Array.isArray(v.value) ? [...v.value] : v.value })),
        ...(item.state ? { state: { ...item.state } } : {})
      })),
      outcomes: test.outcomes.map(o => ({ ...o, value: Array.isArray(o.value) ? [...o.value] : o.value }))
    },
    session: {
      ...(Object.keys(delivery.plugins).length > 0 ? { plugins: { ...delivery.plugins } } : {}),
      // The instance id, as the rendered test names the item-ref: a clone is `item-1#2` (roadmap 1 T4).
      ...(delivery.current ? { navItemRefId: delivery.current } : {})
    }
  };
}
