import { dispatchDeclared, listenDeclared } from '@qti-components/elements/public-events';

import type { View } from '@qti-components/base';
import type { PublicEventDeclaration } from '@qti-components/elements/public-events';
import type { QtiAssessmentTest } from './components/qti-assessment-test/qti-assessment-test';
import type { QtiTestState } from './types/qti-test-state';

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
  'cito-test-loaded': CustomEvent<QtiAssessmentTest>;
  'cito-test-state-changed': CustomEvent<QtiTestState>;
  'cito-item-ref-connected': CustomEvent<{ identifier: string; href: string; category: string }>;
}

export type PublicEventName = keyof PublicEventMap;

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
  'cito-test-rendered': { kind: 'notification', scope: 'test', deprecated: 'qti-test-loaded' },
  'cito-test-loaded': { kind: 'notification', scope: 'test', deprecated: 'qti-assessment-test-connected' },
  'cito-test-state-changed': { kind: 'notification', scope: 'test', deprecated: 'qti-state-changed' },
  'cito-item-ref-connected': { kind: 'notification', scope: 'item', deprecated: 'qti-assessment-item-ref-connected' }
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
