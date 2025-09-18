import type { LitElement } from 'lit';

type LiveQueryHandler = (added: Element[], removed: Element[]) => void;
type LiveQueryHandlerKeys<T extends object> = {
  [K in keyof T]-?: T[K] extends LiveQueryHandler ? K : never;
}[keyof T];

interface LiveQueryOptions {
  /**
   * If true, will only start watching after the initial update/render
   */
  waitUntilFirstUpdate?: boolean;
}

export function liveQuery(querySelector: string, options?: LiveQueryOptions) {
  return <ElemClass extends LitElement>(proto: ElemClass, decoratedFnName: LiveQueryHandlerKeys<ElemClass>): void => {
    const { connectedCallback, disconnectedCallback } = proto;

    proto.connectedCallback = function (this: ElemClass) {
      connectedCallback.call(this);

      const handler = this[decoratedFnName] as unknown as LiveQueryHandler;

      const callback = (mutationList: MutationRecord[]) => {
        const added: Element[] = [];
        const removed: Element[] = [];

        for (const m of mutationList) {
          if (m.type !== 'childList') continue;

          m.addedNodes.forEach(n => {
            if (n.nodeType !== 1) return;
            const el = n as Element;
            if (el.matches?.(querySelector)) added.push(el);
            added.push(...(el.querySelectorAll?.(querySelector) ?? []));
          });

          m.removedNodes.forEach(n => {
            if (n.nodeType !== 1) return;
            const el = n as Element;
            if (el.matches?.(querySelector)) removed.push(el);
            removed.push(...(el.querySelectorAll?.(querySelector) ?? []));
          });
        }

        // deduplicate added and removed (might be multiples since we observe both light and shadow DOM)
        const dedupe = (arr: Element[]) => Array.from(new Set(arr));
        const A = dedupe(added);
        const R = dedupe(removed);

        if (A.length || R.length) {
          handler.call(this, A, R);
        }
      };

      // observe both light and shadow DOM
      const obsLight = new MutationObserver(callback);
      obsLight.observe(this, { childList: true, subtree: true });

      const obsShadow = this.shadowRoot ? new MutationObserver(callback) : null;
      obsShadow?.observe(this.shadowRoot, { childList: true, subtree: true });

      (this as any).__lqObservers = [obsLight, obsShadow].filter((o): o is MutationObserver => !!o);

      const fireInitial = async () => {
        if (options?.waitUntilFirstUpdate && 'updateComplete' in this) {
          await (this as any).updateComplete;
        }
        const initial = [
          ...this.querySelectorAll(querySelector),
          ...(this.shadowRoot?.querySelectorAll(querySelector) ?? [])
        ] as Element[];
        if (initial.length) handler.call(this, initial, []);
      };

      void fireInitial();
    };

    proto.disconnectedCallback = function (this: ElemClass) {
      disconnectedCallback.call(this);
      (this as any).__lqObservers?.forEach((o: MutationObserver) => o.disconnect());
      (this as any).__lqObservers = undefined;
    };
  };
}
