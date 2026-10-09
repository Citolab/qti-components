import { createContext } from '@lit/context';

/**
 * What a component added to a test needs to work with the items the test renders, without knowing
 * how the test lays out its DOM. Provided by `qti-test` about itself.
 *
 * The other contexts carry data; this one hands out elements, because a plugin such as
 * text-to-speech reads the rendered item. The test owns where its items live (inside
 * `test-container`'s shadow root, today), so it answers the lookup instead of every plugin
 * repeating that search.
 */
export interface TestItems {
  /** Where this test's item and navigation events (bubbling, composed) can be listened for. */
  readonly eventTarget: EventTarget;
  /** The rendered `qti-assessment-item` for an item-ref identifier in this test, or null. */
  itemElement(identifier: string): HTMLElement | null;
}

export const testItemsContext = createContext<TestItems>(Symbol('testItemsContext'));
