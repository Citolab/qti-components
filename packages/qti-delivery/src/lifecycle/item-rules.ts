import { itemLifecycleGuards, transition } from './item-lifecycle.js';

import type { SessionControl, TestPartModel } from '../model/test-model.js';
import type { ItemLifecycleInput, ItemLifecycleState } from './item-lifecycle.js';

/**
 * What one item session may do now, answered from its lifecycle state, its session control and its
 * responses. Every reader of attempts, skipping, feedback, review or the solution asks here instead
 * of working the rule out itself (roadmap 1, T3b).
 *
 * The answers follow QTI 3 (`qti-item-session-control`, info model §7.19; implementation guide
 * §4.1 and §4.4.2) and nothing else: whether the last attempt was optimal decides none of them
 * (decided 2026-11-27, `plans/host-api.md`).
 *
 * Experimental (0.x).
 */
export interface ItemRules {
  /**
   * Another attempt is allowed: `max-attempts` not reached (0 is unlimited), or, for an adaptive
   * item, which ignores `max-attempts`, `completionStatus` not `completed`.
   */
  readonly attemptsLeft: boolean;
  /** No further attempt is allowed: the negation of `attemptsLeft`. */
  readonly attemptsUsed: boolean;
  /** The responses can change: only while `interacting`. In every other state they are fixed or not shown. */
  readonly interactive: boolean;
  /** The item session is over: `closed`, or in `review` or `solution`, which come back to `closed`. */
  readonly done: boolean;
  /**
   * The candidate may end the attempt now: the item is `interacting` in a part with individual
   * submission, and `maySubmit` holds.
   */
  readonly mayEndAttempt: boolean;
  /**
   * The responses may be submitted as they are: `allow-skipping="false"` refuses an item with no
   * response, `validate-responses` an invalid one. Two separate rules, both for individual
   * submission only (§7.19).
   */
  readonly maySubmit: boolean;
  /** Submitting no response is allowed: `allow-skipping`, or a response given, or simultaneous submission. */
  readonly maySkip: boolean;
  /**
   * Feedback, modal and integrated, may show: always while attempts are left, after the last
   * attempt only with `show-feedback`. In `review`, an adaptive item with `allow-review` shows its
   * feedback whatever `show-feedback` says (§7.19, `allow-review`).
   */
  readonly mayShowFeedback: boolean;
  /**
   * The item session may enter `review` now: it is `closed`, with `allow-review`. False in `review`
   * itself; whether review shows is the state.
   */
  readonly mayBeginReview: boolean;
  /**
   * The item session may enter `solution`, which shows the correct responses: it is `closed`, with
   * `show-solution`. False in `solution` itself; whether the solution shows is the state.
   */
  readonly mayBeginSolution: boolean;
}

/** What the rules of one item session are read from: its lifecycle input, its state and its responses. */
export interface ItemRulesInput extends Omit<ItemLifecycleInput, 'sessionControl'> {
  /** The item-ref's resolved session control (`ItemRefModel.sessionControl`). */
  sessionControl: Omit<SessionControl, 'allowComment'>;
  /** The item session's lifecycle state. */
  state: ItemLifecycleState;
  /**
   * The candidate gave no response: every response variable holds its default or NULL. False for an
   * item with no response variables, which "by definition cannot be skipped" (§7.19).
   */
  skipped: boolean;
  /** Every interaction's response satisfies its constraints (the item's `valid`). */
  valid: boolean;
}

/** The rules of one item session. Pure: the same input gives the same answers on every runtime. */
export function itemRules(input: ItemRulesInput): ItemRules {
  const { state, sessionControl, adaptive } = input;
  const guards = itemLifecycleGuards(input);
  const individual = guards.individualSubmission;
  const maySkip = !individual || sessionControl.allowSkipping || !input.skipped;
  const maySubmit = maySkip && (!individual || !sessionControl.validateResponses || input.valid);
  return {
    attemptsLeft: guards.attemptsLeft,
    attemptsUsed: !guards.attemptsLeft,
    interactive: state === 'interacting',
    done: state === 'closed' || state === 'review' || state === 'solution',
    mayEndAttempt: maySubmit && transition(state, 'endAttempt', guards) !== null,
    maySubmit,
    maySkip,
    mayShowFeedback:
      guards.attemptsLeft ||
      sessionControl.showFeedback ||
      (state === 'review' && adaptive && sessionControl.allowReview),
    mayBeginReview: transition(state, 'beginReview', guards) !== null,
    mayBeginSolution: transition(state, 'beginSolution', guards) !== null
  };
}

/** Where the candidate is in a part, for its navigation answers. */
export interface NavigationRulesInput {
  navigationMode: TestPartModel['navigationMode'];
  submissionMode: TestPartModel['submissionMode'];
  /** The current item's position among the part's items in order, from 0; -1 when none is current. */
  index: number;
  /** The number of items in the part. */
  count: number;
  /** The rules of the current item. */
  current: Pick<ItemRules, 'maySubmit' | 'interactive'>;
}

/** Whether the candidate may move to the next or the previous item of a part. */
export interface NavigationRules {
  /**
   * There is a next item and, in a linear part with individual submission, the current item may be
   * left: Next ends an attempt that was not ended and closes the item (decided 2026-11-27), so its
   * responses must be ones the candidate may submit.
   */
  readonly mayGoNext: boolean;
  /** There is a previous item, in a nonlinear part: a linear part never goes back (§4.1). */
  readonly mayGoPrevious: boolean;
}

/** The navigation answers of a part. Pure. */
export function navigationRules({
  navigationMode,
  submissionMode,
  index,
  count,
  current
}: NavigationRulesInput): NavigationRules {
  const onItem = index >= 0 && index < count;
  const endsAttempt = navigationMode === 'linear' && submissionMode === 'individual' && current.interactive;
  return {
    mayGoNext: onItem && index < count - 1 && (!endsAttempt || current.maySubmit),
    mayGoPrevious: onItem && index > 0 && navigationMode === 'nonlinear'
  };
}
