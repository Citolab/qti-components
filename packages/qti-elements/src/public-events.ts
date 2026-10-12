import type { InteractionChangedDetails, OutcomeChangedDetails } from './internal/event-types';

/**
 * The public events of the item. The name tells you it is public: everything declared here starts
 * with `cito-`; every other event is internal plumbing and may change in any release.
 *
 * Requests are verbs, notifications are past tense. All bubble and are composed.
 *
 * `deprecated` is the name the event had before it became public. `dispatchPublic` sends and
 * `listenPublic` handles both until the next major, then the field goes.
 */
export interface PublicEventDeclaration {
  kind: 'request' | 'notification';
  scope: 'test' | 'item';
  /** The name before it was public. Dispatched and handled alongside the new one. */
  deprecated?: string;
}

export interface RubricPlacement {
  className: string;
  element: Element;
}

export interface PublicItemEventMap {
  // `cito-item-rendered` (detail: the `QtiAssessmentItem`) is added by qti-assessment-item.ts, so this
  // module imports no element: that import would be a cycle.
  'cito-item-response-changed': CustomEvent<InteractionChangedDetails>;
  'cito-item-outcome-changed': CustomEvent<OutcomeChangedDetails>;
  /** Cancelable: `preventDefault()` keeps the rubric block where it is. */
  'cito-item-rubric-placement': CustomEvent<RubricPlacement>;
}

export type PublicItemEventName = keyof PublicItemEventMap;

export const PUBLIC_ITEM_EVENTS: Record<PublicItemEventName, PublicEventDeclaration> = {
  // The old name `qti-assessment-item-connected` stays as internal plumbing: it is sent separately.
  'cito-item-rendered': { kind: 'notification', scope: 'item' },
  'cito-item-response-changed': { kind: 'notification', scope: 'item', deprecated: 'qti-interaction-changed' },
  'cito-item-outcome-changed': { kind: 'notification', scope: 'item', deprecated: 'qti-outcome-changed' },
  'cito-item-rubric-placement': {
    kind: 'notification',
    scope: 'item',
    deprecated: 'qti-rubric:discretionary-placement'
  }
};

declare global {
  interface HTMLElementEventMap extends PublicItemEventMap {}
}

/**
 * Dispatch `name` and its deprecated name with the same `detail` object, new name first. Returns
 * `false` when a listener of either cancelled the event. The detail is always an object.
 * Shared by the item and test tiers; use `dispatchPublic` (item) or the test's own wrapper.
 */
export function dispatchDeclared(
  target: EventTarget,
  declarations: Record<string, PublicEventDeclaration>,
  name: string,
  detail: unknown,
  cancelable = false
): boolean {
  const init = { detail: detail ?? {}, bubbles: true, composed: true, cancelable };
  const notCancelled = target.dispatchEvent(new CustomEvent(name, init));
  const { deprecated } = declarations[name];
  if (!deprecated) return notCancelled;
  return target.dispatchEvent(new CustomEvent(deprecated, init)) && notCancelled;
}

const warned = new Set<string>();

/**
 * Listen for `name` and its deprecated name. `dispatchDeclared` sends the old name straight after
 * the new one, synchronously, with the same `detail`: that one is skipped, so the handler runs
 * once. A host that sends only the old name is handled too, and warned once per name in the
 * console: only a sender outside our own components gets here without the new name before it.
 */
export function listenDeclared(
  target: EventTarget,
  declarations: Record<string, PublicEventDeclaration>,
  name: string,
  handler: (e: Event) => void
): void {
  let justHandled: unknown;
  target.addEventListener(name, e => {
    justHandled = (e as CustomEvent).detail;
    queueMicrotask(() => (justHandled = undefined));
    handler(e);
  });
  const { deprecated } = declarations[name];
  if (deprecated) {
    target.addEventListener(deprecated, e => {
      if (justHandled !== undefined && (e as CustomEvent).detail === justHandled) return;
      if (!warned.has(deprecated)) {
        warned.add(deprecated);
        console.warn(`[qti-components] The event "${deprecated}" is deprecated; dispatch "${name}" instead.`);
      }
      handler(e);
    });
  }
}

export function dispatchPublic<K extends PublicItemEventName>(
  target: EventTarget,
  name: K,
  detail: PublicItemEventMap[K] extends CustomEvent<infer D> ? D : never,
  cancelable = false
): boolean {
  return dispatchDeclared(target, PUBLIC_ITEM_EVENTS, name, detail, cancelable);
}

export function listenPublic<K extends PublicItemEventName>(
  target: EventTarget,
  name: K,
  handler: (e: PublicItemEventMap[K]) => void
): void {
  listenDeclared(target, PUBLIC_ITEM_EVENTS, name, handler as (e: Event) => void);
}
