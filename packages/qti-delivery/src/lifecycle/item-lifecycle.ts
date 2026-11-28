import type { SessionControl, TestPartModel } from '../model/test-model.js';

/**
 * The item session lifecycle (QTI 3 info model §2.2.1, Figure 2.1) as one finite state machine per
 * item instance: every item session is in exactly one of these states, and only the transitions in
 * `ITEM_LIFECYCLE` happen. Each rule of item session control is a guard on one of them.
 *
 * ```mermaid
 * stateDiagram-v2
 *   [*] --> initial
 *   initial --> interacting: beginAttempt [attemptsLeft]
 *   initial --> closed: endItemSession
 *   interacting --> closed: endAttempt [individualSubmission, no attemptsLeft]
 *   interacting --> modalFeedback: endAttempt [individualSubmission, attemptsLeft, modalFeedback]
 *   interacting --> interacting: endAttempt [individualSubmission, attemptsLeft]
 *   interacting --> suspended: endCandidateSession
 *   interacting --> closed: endItemSession
 *   modalFeedback --> interacting: beginAttempt [attemptsLeft]
 *   modalFeedback --> suspended: endCandidateSession
 *   modalFeedback --> closed: endItemSession
 *   suspended --> interacting: beginCandidateSession [mayResume]
 *   suspended --> closed: endItemSession
 *   closed --> review: beginReview [allowReview]
 *   review --> closed: endReview
 *   closed --> solution: beginSolution [showSolution]
 *   solution --> closed: endSolution
 * ```
 *
 * What QTI ties to the states: interactions are enabled in `interacting` only; in `closed` and
 * `review` the responses show but are fixed; in `solution` the correct responses show instead. An
 * item that goes from `initial` straight to `closed` keeps NULL responses.
 *
 * The text of §2.2.1 names six states; `modalFeedback` comes from its figure (Figure 2.1, as this
 * plan reads it): the item after an attempt whose response processing set modal feedback, with
 * attempts left ("modal feedback is shown to the candidate directly following response
 * processing", §2.6). The candidate reads it before trying again.
 *
 * Experimental (0.x): roadmap 1 phase T3; see `plans/delivery-state.md`.
 */
export const ITEM_LIFECYCLE_STATES = [
  'initial',
  'interacting',
  'modalFeedback',
  'suspended',
  'closed',
  'review',
  'solution'
] as const;

export type ItemLifecycleState = (typeof ITEM_LIFECYCLE_STATES)[number];

/**
 * What happens to an item session, in QTI's words (info model §2.2.1). The delivery's commands
 * (`navigate`, `beginAttempt`, `endAttempt`, `endTestPart`, `timeUp`) are turned into these, per item.
 */
export const ITEM_LIFECYCLE_EVENTS = [
  'beginAttempt',
  'endAttempt',
  'endCandidateSession',
  'beginCandidateSession',
  'endItemSession',
  'beginReview',
  'endReview',
  'beginSolution',
  'endSolution'
] as const;

export type ItemLifecycleEvent = (typeof ITEM_LIFECYCLE_EVENTS)[number];

/** The conditions a transition can depend on; `itemLifecycleGuards` reads them for one item. */
export const ITEM_LIFECYCLE_GUARDS = [
  'attemptsLeft',
  'individualSubmission',
  'modalFeedback',
  'mayResume',
  'allowReview',
  'showSolution'
] as const;

export type ItemLifecycleGuard = (typeof ITEM_LIFECYCLE_GUARDS)[number];

export type ItemLifecycleGuards = Readonly<Record<ItemLifecycleGuard, boolean>>;

/** One way out of a state: taken when every `when` guard holds and no `unless` guard does. */
export interface ItemLifecycleBranch {
  readonly to: ItemLifecycleState;
  readonly when?: readonly ItemLifecycleGuard[];
  readonly unless?: readonly ItemLifecycleGuard[];
}

/** A state with no guard, or branches tried in order, the first that holds taken. */
export type ItemLifecycleTarget = ItemLifecycleState | readonly ItemLifecycleBranch[];

/** The transition table: a pair it does not list is refused. */
export const ITEM_LIFECYCLE: Readonly<
  Record<ItemLifecycleState, Readonly<Partial<Record<ItemLifecycleEvent, ItemLifecycleTarget>>>>
> = {
  initial: {
    beginAttempt: [{ to: 'interacting', when: ['attemptsLeft'] }],
    endItemSession: 'closed'
  },
  interacting: {
    // The guards are read after response processing, with the ended attempt counted.
    endAttempt: [
      { to: 'closed', when: ['individualSubmission'], unless: ['attemptsLeft'] },
      { to: 'modalFeedback', when: ['individualSubmission', 'attemptsLeft', 'modalFeedback'] },
      { to: 'interacting', when: ['individualSubmission', 'attemptsLeft'] }
    ],
    endCandidateSession: 'suspended',
    endItemSession: 'closed'
  },
  modalFeedback: {
    beginAttempt: [{ to: 'interacting', when: ['attemptsLeft'] }],
    endCandidateSession: 'suspended',
    endItemSession: 'closed'
  },
  suspended: {
    beginCandidateSession: [{ to: 'interacting', when: ['mayResume'] }],
    endItemSession: 'closed'
  },
  closed: {
    beginReview: [{ to: 'review', when: ['allowReview'] }],
    beginSolution: [{ to: 'solution', when: ['showSolution'] }]
  },
  review: {
    endReview: 'closed'
  },
  solution: {
    endSolution: 'closed'
  }
};

/**
 * The state an item session goes to on `event`, or null when the table refuses it: the pair is not
 * listed, or no branch's guards hold. Pure: the same state, event and guards give the same answer
 * on every runtime.
 */
export function transition(
  state: ItemLifecycleState,
  event: ItemLifecycleEvent,
  guards: ItemLifecycleGuards
): ItemLifecycleState | null {
  const target = ITEM_LIFECYCLE[state][event];
  if (target === undefined) return null;
  if (typeof target === 'string') return target;
  const branch = target.find(
    ({ when = [], unless = [] }) => when.every(guard => guards[guard]) && !unless.some(guard => guards[guard])
  );
  return branch?.to ?? null;
}

/** What the guards of one item session are read from. */
export interface ItemLifecycleInput {
  /** The item-ref's resolved session control (`ItemRefModel.sessionControl`). */
  sessionControl: Pick<SessionControl, 'maxAttempts' | 'allowReview' | 'showSolution'>;
  /** From the item's facts (`ItemFacts.adaptive`). */
  adaptive: boolean;
  navigationMode: TestPartModel['navigationMode'];
  submissionMode: TestPartModel['submissionMode'];
  /** The item's `numAttempts`. */
  numAttempts: number;
  /** The item's `completionStatus` (`not_attempted`, `unknown`, `incomplete`, `completed`). */
  completionStatus: string | null;
  /** The candidate has moved on from the item; in a linear part there is no way back. */
  left: boolean;
  /** The last response processing set modal feedback to show. */
  modalFeedback: boolean;
}

/**
 * Whether another attempt is allowed (implementation guide §4.4.2.1): a non-adaptive item until it
 * has used `max-attempts` (0 is unlimited); an adaptive item, which ignores `max-attempts`, until its
 * response processing set `completionStatus` to `completed`.
 */
export function hasAttemptsLeft({
  sessionControl: { maxAttempts },
  adaptive,
  numAttempts,
  completionStatus
}: Pick<ItemLifecycleInput, 'sessionControl' | 'adaptive' | 'numAttempts' | 'completionStatus'>): boolean {
  if (adaptive) return completionStatus !== 'completed';
  return maxAttempts === 0 || numAttempts < maxAttempts;
}

/** The guards of one item session, from its session control, its facts, its part and its variables. */
export function itemLifecycleGuards(input: ItemLifecycleInput): ItemLifecycleGuards {
  return {
    attemptsLeft: hasAttemptsLeft(input),
    // In a simultaneous part every response is processed when the part is submitted (§4.1).
    individualSubmission: input.submissionMode === 'individual',
    modalFeedback: input.modalFeedback,
    // A linear part restricts the candidate to each item in turn: once left, never again (§4.1).
    mayResume: input.navigationMode === 'nonlinear' || !input.left,
    allowReview: input.sessionControl.allowReview,
    showSolution: input.sessionControl.showSolution
  };
}
