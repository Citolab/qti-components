// @watch decorator
//
// Runs when an observed property changes, e.g. @property or @state, but before the component updates.
//
// To wait for an update to complete after a change occurs, use `await this.updateComplete` in the handler. To start
// watching after the initial update/render, use `{ waitUntilFirstUpdate: true }` or `this.hasUpdated` in the handler.
//
// Usage:
//
//  @watch('propName')
//  handlePropChange(oldValue, newValue) {
//    ...
//  }

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
}

export function liveQuery(querySelector: string, options?: LiveQueryOptions) {
  let observer: MutationObserver;
  const resolvedOptions: Required<LiveQueryOptions> = {
    ...options
  };
  return <ElemClass extends LitElement>(
    proto: ElemClass,
    decoratedFnName: UpdateHandlerFunctionKeys<ElemClass>
  ): void => {
    const { connectedCallback, disconnectedCallback } = proto;

    proto.connectedCallback = function (this: ElemClass) {
      connectedCallback.call(this);
      const callback = (mutationList: MutationRecord[]) => {
        const elementsToWatch = Array.from(this.querySelectorAll(querySelector)).concat(
          Array.from(this.shadowRoot?.querySelectorAll(querySelector) || [])
        );
        for (const mutation of mutationList) {
          const addedNodes = Array.from(mutation.addedNodes).map(e => e as Element);
          const removedNodes = Array.from(mutation.addedNodes).map(e => e as Element);
          if (mutation.type === 'childList' && addedNodes.find(n => elementsToWatch.includes(n))) {
            (this[decoratedFnName] as unknown as UpdateHandler)(addedNodes, removedNodes);
          }
        }
      };
      observer = new MutationObserver(callback);
      observer.observe(this, { childList: true, subtree: true });

      const elementsAdded = Array.from(this.querySelectorAll(querySelector)).concat(
        Array.from(this.shadowRoot?.querySelectorAll(querySelector) || [])
      );
      (this[decoratedFnName] as unknown as UpdateHandler)(Array.from(elementsAdded), []);
    };

    proto.disconnectedCallback = function (this: ElemClass) {
      disconnectedCallback.call(this);
      observer.disconnect();
    };
  };
}
