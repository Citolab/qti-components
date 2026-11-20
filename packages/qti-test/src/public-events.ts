import { dispatchDeclared, listenDeclared } from '@qti-components/elements/public-events';

import type { View } from '@qti-components/base';
import type { PublicEventDeclaration } from '@qti-components/elements/public-events';
import type { QtiTestState } from './types/qti-test-state';

/**
 * The public events of the test. The name tells you it is public: everything here starts with
 * `qc-`; every other event is internal plumbing and may change in any release.
 *
 * Requests are verbs (a host or plugin dispatches them at the test), notifications are past tense
 * (the test dispatches them). All bubble and are composed.
 *
 * `deprecated` is the `cito-` name this event had in 9.x. One helper (`dispatchPublic`,
 * `listenPublic`) sends or handles both names until the next major, then the field goes. The 7.x
 * names (`qti-request-navigation`, `test-end-attempt`, `on-test-switch-view`, …) are no longer sent
 * or handled.
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
  'qc-test-navigate': CustomEvent<NavigationTarget>;
  /**
   * Ends an attempt: processes the response of the item-ref `itemId`, or, without it, of the item on
   * screen. `<test-end-attempt>` sends the `itemId` of the item it is stamped into or names.
   */
  'qc-test-end-attempt': CustomEvent<{ itemId?: string }>;
  /** Scores the test: resets its outcomes to their defaults, runs outcome processing, then `qc-test-submitted`. */
  'qc-test-submit': CustomEvent<Record<string, never>>;
  'qc-test-update-outcome': CustomEvent<{
    assessmentItemRefId: string;
    outcomeVariableId: string;
    value: number | string;
  }>;
  'qc-test-switch-view': CustomEvent<View>;
  /** `value` is JSON; `null` or `undefined` removes the plugin's entry. */
  'qc-test-update-plugin-state': CustomEvent<{ plugin: string; value: unknown }>;
  /** Outcome processing ran after a submit: read the test outcomes now. */
  'qc-test-submitted': CustomEvent<Record<string, never>>;
  'qc-test-navigated': CustomEvent<NavigationTarget>;
  'qc-test-navigation-started': CustomEvent<NavigationTarget>;
  'qc-test-navigation-failed': CustomEvent<NavigationFailure>;
  'qc-test-rendered': CustomEvent<{ identifier: string; element: Element }[]>;
  // `qc-test-loaded` (detail: the `QtiAssessmentTest`) is added by qti-assessment-test.ts, so this
  // module imports no element: that import would be a cycle.
  'qc-test-state-changed': CustomEvent<QtiTestState>;
  'qc-test-items-skipped': CustomEvent<{ ids: string[] }>;
  'qc-test-end-reached': CustomEvent<Record<string, never>>;
  'qc-item-ref-connected': CustomEvent<{ identifier: string; href: string; category: string }>;
}

export type PublicEventName = keyof PublicEventMap;

export const PUBLIC_EVENTS: Record<PublicEventName, PublicEventDeclaration> = {
  'qc-test-navigate': { kind: 'request', scope: 'test', deprecated: 'cito-test-navigate' },
  'qc-test-end-attempt': { kind: 'request', scope: 'test', deprecated: 'cito-test-end-attempt' },
  'qc-test-submit': { kind: 'request', scope: 'test', deprecated: 'cito-test-submit' },
  'qc-test-update-outcome': { kind: 'request', scope: 'test', deprecated: 'cito-test-update-outcome' },
  'qc-test-update-plugin-state': { kind: 'request', scope: 'test', deprecated: 'cito-test-update-plugin-state' },
  'qc-test-switch-view': { kind: 'request', scope: 'test', deprecated: 'cito-test-switch-view' },
  'qc-test-submitted': { kind: 'notification', scope: 'test', deprecated: 'cito-test-submitted' },
  'qc-test-navigated': { kind: 'notification', scope: 'test', deprecated: 'cito-test-navigated' },
  'qc-test-navigation-started': { kind: 'notification', scope: 'test', deprecated: 'cito-test-navigation-started' },
  'qc-test-navigation-failed': { kind: 'notification', scope: 'test', deprecated: 'cito-test-navigation-failed' },
  'qc-test-rendered': { kind: 'notification', scope: 'test', deprecated: 'cito-test-rendered' },
  'qc-test-loaded': { kind: 'notification', scope: 'test', deprecated: 'cito-test-loaded' },
  'qc-test-state-changed': { kind: 'notification', scope: 'test', deprecated: 'cito-test-state-changed' },
  'qc-test-items-skipped': { kind: 'notification', scope: 'test', deprecated: 'cito-test-items-skipped' },
  'qc-test-end-reached': { kind: 'notification', scope: 'test', deprecated: 'cito-test-end-reached' },
  'qc-item-ref-connected': { kind: 'notification', scope: 'item', deprecated: 'cito-item-ref-connected' }
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
  dispatchDeclared(target, PUBLIC_EVENTS, name, detail);
}

/**
 * Listen for a public event and its deprecated name; the handler runs once for a sender that
 * dispatched both. See `listenDeclared`.
 */
export function listenPublic<K extends PublicEventName>(
  target: EventTarget,
  name: K,
  handler: (e: PublicEventMap[K]) => void
): void {
  listenDeclared(target, PUBLIC_EVENTS, name, handler as (e: Event) => void);
}
