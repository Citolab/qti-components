// @liveQuery decorator
//
// Runs when observed elements change in the DOM
//
// Usage:
//
// @liveQuery('selector')
// handleElementChange(added, removed) {
// ...
// }
//
// @liveQuery(() => [...elements])
// handleElementChange(added, removed) {
// ...
// }
import type { LitElement } from 'lit';

type UpdateHandler = (prev?: unknown, next?: unknown) => void;
type NonUndefined<A> = A extends undefined ? never : A;
type UpdateHandlerFunctionKeys<T extends object> = {
  [K in keyof T]-?: NonUndefined<T[K]> extends UpdateHandler ? K : never;
}[keyof T];

interface LiveQueryOptions {
  /**
   * If true, will only start watching after the initial update/render
   */
  waitUntilFirstUpdate?: boolean;
}

// Type for selector - can be string or function returning elements
type ElementSelector = string | (() => HTMLElement[]);

export function liveQuery(querySelector: ElementSelector, options?: LiveQueryOptions) {
  let observer: MutationObserver;
  let previousElements: HTMLElement[] = [];
  const resolvedOptions: Required<LiveQueryOptions> = {
    waitUntilFirstUpdate: false,
    ...options
  };

  return <ElemClass extends LitElement>(
    proto: ElemClass,
    decoratedFnName: UpdateHandlerFunctionKeys<ElemClass>
  ): void => {
    const { connectedCallback, disconnectedCallback } = proto;

    // Helper function to get elements based on selector type
    const getElements = function (this: ElemClass): HTMLElement[] {
      if (typeof querySelector === 'function') {
        // For function selectors, call the function in the context of 'this'
        return querySelector.call(this);
      } else if (querySelector && querySelector.trim() !== '') {
        // For string selectors, use querySelectorAll
        return Array.from(this.querySelectorAll(querySelector)).concat(
          Array.from(this.shadowRoot?.querySelectorAll(querySelector) || [])
        ) as HTMLElement[];
      }
      return [];
    };

    // Helper function to check for changes when using function selectors
    const checkForChanges = function (this: ElemClass) {
      if (typeof querySelector === 'function') {
        const currentElements = getElements.call(this);
        const addedElements = currentElements.filter(el => !previousElements.includes(el));
        const removedElements = previousElements.filter(el => !currentElements.includes(el));

        if (addedElements.length > 0 || removedElements.length > 0) {
          (this[decoratedFnName] as unknown as UpdateHandler)(addedElements, removedElements);
          previousElements = [...currentElements];
        }
      }
    };

    proto.connectedCallback = function (this: ElemClass) {
      connectedCallback.call(this);

      const startWatching = () => {
        if (typeof querySelector === 'function') {
          // For function selectors, we need to poll for changes since we can't use MutationObserver directly

          const initialElements = getElements.call(this);
          previousElements = [...initialElements];

          // Trigger initial callback
          if (initialElements.length > 0) {
            (this[decoratedFnName] as unknown as UpdateHandler)(initialElements, []);
          }
          console.log(`LiveQuery: Watching elements with function selector in ${this.localName}`);
          // Set up MutationObserver to trigger checks when DOM changes
          observer = new MutationObserver(() => {
            checkForChanges.call(this);
          });
          observer.observe(this, { childList: true, subtree: true, attributes: true });
        } else if (querySelector && querySelector.trim() !== '') {
          // Original string selector logic
          const callback = (mutationList: MutationRecord[]) => {
            const elementsToWatch = getElements.call(this);

            for (const mutation of mutationList) {
              const addedNodes = Array.from(mutation.addedNodes).filter(
                node => node.nodeType === Node.ELEMENT_NODE
              ) as Element[];
              const removedNodes = Array.from(mutation.removedNodes).filter(
                node => node.nodeType === Node.ELEMENT_NODE
              ) as Element[];

              const relevantAdded = addedNodes.filter(n => elementsToWatch.includes(n as HTMLElement));
              const relevantRemoved = removedNodes.filter(n => elementsToWatch.includes(n as HTMLElement));

              if (mutation.type === 'childList' && (relevantAdded.length > 0 || relevantRemoved.length > 0)) {
                (this[decoratedFnName] as unknown as UpdateHandler)(relevantAdded, relevantRemoved);
              }
            }
          };

          observer = new MutationObserver(callback);
          observer.observe(this, { childList: true, subtree: true });

          // Trigger initial callback
          const elementsAdded = getElements.call(this);
          if (elementsAdded.length > 0) {
            (this[decoratedFnName] as unknown as UpdateHandler)(elementsAdded, []);
          }
        }
      };

      if (resolvedOptions.waitUntilFirstUpdate) {
        // Wait for the first update to complete before starting to watch
        this.updateComplete.then(() => {
          startWatching();
        });
      } else {
        startWatching();
      }
    };

    proto.disconnectedCallback = function (this: ElemClass) {
      disconnectedCallback.call(this);
      if (observer) {
        observer.disconnect();
      }
      previousElements = [];
    };
  };
}
