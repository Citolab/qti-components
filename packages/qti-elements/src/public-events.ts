import type {
  InteractionChangedDetails,
  OutcomeChangedDetails,
  OutcomesChangedDetails,
  SetOutcomesDetails
} from './internal/event-types';

/**
 * The public events of the item. The name tells you it is public: everything declared here starts
 * with `qc-`; every other event is internal plumbing and may change in any release.
 *
 * Requests are verbs, notifications are past tense. All bubble and are composed.
 *
 * `deprecated` is the `cito-` name the event had in 9.x. `dispatchPublic` sends and `listenPublic`
 * handles both until the next major, then the field goes. The 7.x names (`qti-interaction-changed`,
 * `qti-outcome-changed`, `qti-rubric:discretionary-placement`) are no longer sent or handled.
 */
export interface PublicEventDeclaration {
  kind: 'request' | 'notification';
  scope: 'test' | 'item';
  /** The previous name. Dispatched and handled alongside the new one. */
  deprecated?: string;
}

export interface RubricPlacement {
  className: string;
  element: Element;
}

/** The detail of `qc-feedback-show` and `qc-feedback-hide`. */
export interface FeedbackEventDetail {
  kind: 'block' | 'inline' | 'modal';
  /** The feedback's `identifier`. */
  identifier: string;
  /** The outcome it follows (`outcome-identifier`). */
  outcomeIdentifier: string;
  /** The feedback element itself: read or clone its content (it stays in the DOM, hidden). */
  element: Element;
  /** The identifier of the item it is in, when it is in one. */
  itemIdentifier?: string;
}

export interface PublicItemEventMap {
  // `qc-item-rendered` (detail: the `QtiAssessmentItem`) is added by qti-assessment-item.ts, so this
  // module imports no element: that import would be a cycle.
  'qc-item-response-changed': CustomEvent<InteractionChangedDetails>;
  /**
   * Request: the item applies these outcomes in one update. Response processing sends it; a host
   * that scores on a backend sends it on the item with the outcomes the backend returned.
   */
  'qc-item-set-outcomes': CustomEvent<SetOutcomesDetails>;
  /** One per outcome an update applied, with its final value, after the item context is published. */
  'qc-item-outcome-changed': CustomEvent<OutcomeChangedDetails>;
  /** All the outcomes one update applied, after the item context is published. */
  'qc-item-outcomes-changed': CustomEvent<OutcomesChangedDetails>;
  /** Cancelable: `preventDefault()` keeps the rubric block where it is. */
  'qc-item-rubric-placement': CustomEvent<RubricPlacement>;
  /**
   * Cancelable: the feedback element is about to show (its condition turned true). `preventDefault()`
   * keeps it hidden, so the host can show the content itself. Sent once per showing.
   */
  'qc-feedback-show': CustomEvent<FeedbackEventDetail>;
  /** The condition of a feedback that was shown (or taken over by the host) turned false again. */
  'qc-feedback-hide': CustomEvent<FeedbackEventDetail>;
}

export type PublicItemEventName = keyof PublicItemEventMap;

export const PUBLIC_ITEM_EVENTS: Record<PublicItemEventName, PublicEventDeclaration> = {
  // The old name `qti-assessment-item-connected` stays as internal plumbing: it is sent separately.
  'qc-item-rendered': { kind: 'notification', scope: 'item', deprecated: 'cito-item-rendered' },
  'qc-item-response-changed': { kind: 'notification', scope: 'item', deprecated: 'cito-item-response-changed' },
  'qc-item-set-outcomes': { kind: 'request', scope: 'item', deprecated: 'cito-item-set-outcomes' },
  'qc-item-outcome-changed': { kind: 'notification', scope: 'item', deprecated: 'cito-item-outcome-changed' },
  'qc-item-outcomes-changed': { kind: 'notification', scope: 'item', deprecated: 'cito-item-outcomes-changed' },
  'qc-item-rubric-placement': { kind: 'notification', scope: 'item', deprecated: 'cito-item-rubric-placement' },
  'qc-feedback-show': { kind: 'notification', scope: 'item', deprecated: 'cito-feedback-show' },
  'qc-feedback-hide': { kind: 'notification', scope: 'item', deprecated: 'cito-feedback-hide' }
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
