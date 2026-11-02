import type { ItemInstanceId, DeliveryState } from './delivery-state.js';

/**
 * What a candidate, a host or a timer asks of the delivery. A server can sit at this boundary: the
 * browser sends commands, the server answers with the new state and the effects.
 *
 * Experimental (0.x): the shapes are settled here; roadmap 1 (T3, T7, T8) gives them behaviour.
 */
export type Command =
  | { type: 'navigate'; target: NavigationTarget }
  | { type: 'beginAttempt'; item: ItemInstanceId }
  | { type: 'endAttempt'; item: ItemInstanceId }
  | { type: 'endTestPart' }
  | { type: 'timeUp'; scope: 'test' | 'testPart' | 'section' | 'item'; identifier: string };

export type NavigationTarget =
  | { kind: 'next' }
  | { kind: 'previous' }
  | { kind: 'item'; item: ItemInstanceId }
  | { kind: 'section'; identifier: string }
  | { kind: 'feedback'; identifier: string };

/**
 * What the runtime has to do for a command: `delivery` decides, the runtime (a browser element, a
 * server) carries it out.
 */
export type Effect =
  | { type: 'loadItem'; item: ItemInstanceId }
  | { type: 'runResponseProcessing'; item: ItemInstanceId }
  | { type: 'runOutcomeProcessing' }
  | { type: 'showTestFeedback'; identifier: string }
  | { type: 'testEnded' };

export interface Transition {
  state: DeliveryState;
  effects: Effect[];
}
