import type { View } from '@qti-components/base';

/**
 * The public events of the test. The name tells you it is public: everything here starts with
 * `cito-`; every other event is internal plumbing and may change in any release.
 *
 * Requests are verbs (a host or plugin dispatches them at the test), notifications are past tense
 * (the test dispatches them). All bubble and are composed.
 *
 * `deprecated` is the name this event had before it became public. One helper (`dispatchPublic`,
 * `listenPublic`) sends or handles both names until the next major, then the field goes.
 */
export interface NavigationTarget {
  type: 'item' | 'section';
  id: string;
}

export interface NavigationFailure {
  message: string;
  details?: unknown;
  itemId?: string;
  sectionId?: string;
}

export interface PublicEventMap {
  'cito-test-navigate': CustomEvent<NavigationTarget>;
  'cito-test-end-attempt': CustomEvent<unknown>;
  'cito-test-update-outcome': CustomEvent<{
    assessmentItemRefId: string;
    outcomeVariableId: string;
    value: number | string;
  }>;
  'cito-test-switch-view': CustomEvent<View>;
  'cito-test-navigated': CustomEvent<NavigationTarget>;
  'cito-test-navigation-started': CustomEvent<NavigationTarget>;
  'cito-test-navigation-failed': CustomEvent<NavigationFailure>;
  'cito-test-rendered': CustomEvent<{ identifier: string; element: Element }[]>;
}

export type PublicEventName = keyof PublicEventMap;

export interface PublicEventDeclaration {
  kind: 'request' | 'notification';
  scope: 'test';
  /** The name before it was public. Dispatched and handled alongside the new one. */
  deprecated?: string;
}

export const PUBLIC_EVENTS: Record<PublicEventName, PublicEventDeclaration> = {
  'cito-test-navigate': { kind: 'request', scope: 'test', deprecated: 'qti-request-navigation' },
  'cito-test-end-attempt': { kind: 'request', scope: 'test', deprecated: 'test-end-attempt' },
  'cito-test-update-outcome': { kind: 'request', scope: 'test', deprecated: 'test-update-outcome-variable' },
  'cito-test-switch-view': { kind: 'request', scope: 'test', deprecated: 'on-test-switch-view' },
  'cito-test-navigated': { kind: 'notification', scope: 'test' },
  'cito-test-navigation-started': {
    kind: 'notification',
    scope: 'test',
    deprecated: 'qti-navigation-loading-started'
  },
  'cito-test-navigation-failed': { kind: 'notification', scope: 'test', deprecated: 'qti-navigation-error' },
  'cito-test-rendered': { kind: 'notification', scope: 'test', deprecated: 'qti-test-loaded' }
};

declare global {
  interface HTMLElementEventMap extends PublicEventMap {}
}

/**
 * Dispatch a public event, and its deprecated name with the same `detail` object. The detail is
 * always an object so `listenPublic` can tell the two apart from one dispatch.
 */
export function dispatchPublic<K extends PublicEventName>(
  target: EventTarget,
  name: K,
  detail: PublicEventMap[K] extends CustomEvent<infer D> ? D : never
): void {
  const init = { detail: detail ?? {}, bubbles: true, composed: true };
  target.dispatchEvent(new CustomEvent(name, init));
  const { deprecated } = PUBLIC_EVENTS[name];
  if (deprecated) target.dispatchEvent(new CustomEvent(deprecated, init));
}

/**
 * Listen for a public event and its deprecated name. A sender that dispatched both (our own
 * `dispatchPublic`) runs the handler once; a host that still sends only the old name runs it too.
 */
export function listenPublic<K extends PublicEventName>(
  target: EventTarget,
  name: K,
  handler: (e: PublicEventMap[K]) => void
): void {
  const seen = new WeakSet<object>();
  const listener = (e: Event) => {
    const { detail } = e as CustomEvent;
    if (detail && typeof detail === 'object') {
      if (seen.has(detail)) return;
      seen.add(detail);
    }
    handler(e as PublicEventMap[K]);
  };
  target.addEventListener(name, listener);
  const { deprecated } = PUBLIC_EVENTS[name];
  if (deprecated) target.addEventListener(deprecated, listener);
}
