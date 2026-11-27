import { createContext } from '@lit/context';

import type { ItemFacts } from '@qti-components/delivery';

/**
 * The facts of every item fetched so far, by item-ref identifier, read from the item XML when
 * `qti-test` loads it (`readItemFacts`). `test-navigation` puts them on the `computedContext` items.
 * A new map on every change, so subscribers are notified. Internal: not exported, not API.
 */
export type ItemFactsByRef = ReadonlyMap<string, ItemFacts>;

export const itemFactsContext = createContext<ItemFactsByRef>(Symbol('itemFacts'));
