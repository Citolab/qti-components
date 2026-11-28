import type { View } from '../session.context';
import type { ComputedItemContext } from './computed-item.types';

/**
 * QTI 3 `qti-item-session-control`, resolved per attribute: each comes from the closest level that
 * declares it (the item-ref, its enclosing sections, the test part), its QTI default only when none
 * does (implementation guide §4.4.2). These are the values QTI gives; whether the player applies
 * each one is roadmap 1's T3 (`allowReview`, `allowComment` and `validateResponses` have no effect
 * yet, and `allowSkipping` and `validateResponses` apply only in a part with individual submission).
 */
export type SessionControl = {
  /** `max-attempts`: 0 means unlimited; 1 when no level declares it. Ignored for an adaptive item. */
  maxAttempts: number;
  /** `show-feedback`; default false. */
  showFeedback: boolean;
  /** `allow-review`; default true. */
  allowReview: boolean;
  /** `show-solution`; default false. */
  showSolution: boolean;
  /** `allow-comment`; default false. */
  allowComment: boolean;
  /** `allow-skipping`; default true. Individual submission only. */
  allowSkipping: boolean;
  /** `validate-responses`; default false. Individual submission only. */
  validateResponses: boolean;
};

export type ComputedItem = ComputedItemContext & {
  categories?: string[]; // not necessary for outside world
  type?: 'info' | 'regular';
  /** The item's number in the test's document order, counting no info items; null for an info item. */
  index?: number;
  active?: boolean;
  /** The item's `qti-item-session-control`, resolved (see `SessionControl`). */
  sessionControl: SessionControl;
  numAttempts?: number;
  valid?: boolean;
  isDefaultResponse?: boolean;
  done?: boolean;
  /** Last *ended attempt* reached the optimal outcome (best achievable score / correct response). */
  optimal?: boolean;
};

/**
 * The test as plugins and hosts read it: its structure, the resolved rules, facts about each item and
 * the candidate's state, in one object. Provided by `test-navigation`, which derives it anew on every
 * update from the test, the item facts, the candidate's state and `initContext`; never edited, so
 * read it and do not write to it (a write is gone at the next update).
 */
export type ComputedContext = {
  view: View;
  /** What test plugins keep, by plugin name (`QtiTestState.session.plugins`). Read-only; write with `qc-test-update-plugin-state`. */
  plugins?: Readonly<Record<string, unknown>>;
  identifier: string;
  title: string;
  testParts: {
    active?: boolean;
    identifier: string;
    navigationMode: 'linear' | 'nonlinear';
    submissionMode: 'individual' | 'simultaneous';
    allowSkipping?: boolean;
    /**
     * The item-ref identifiers of the part in the test's document order, info items included: the
     * order a candidate takes them in. `sections` is depth first, so where a section's item-refs and
     * subsections interleave, flattening `sections` gives another order; read the items in order with
     * `itemsInOrder(testPart)` from `@qti-components/test`.
     */
    itemOrder?: string[];
    /**
     * Every section of the part once, nested ones included, depth first (a section before its
     * subsections), each with only its own item-refs, so every item is listed once. Where a
     * section's item-refs and subsections interleave, this order is not the test's; `index` is.
     */
    sections: {
      active?: boolean;
      identifier: string;
      title: string;
      /** Every item in the section and its subsections is completed. */
      completed?: boolean;
      /** This section's own item-refs, not those of its subsections; empty for a section that only holds sections. */
      items: ComputedItem[];
      allowSkipping?: boolean;
    }[];
  }[];
  /**
   * The rendered `qti-assessment-item` for an item-ref identifier, or null when it is not on the
   * page. Looked up when called, so it is never a stale element; ask again after the context
   * updates (it does when an item is rendered). A function, so `JSON.stringify` leaves it out.
   * Set by `test-navigation`; for plugins that read an item's content (e.g. text-to-speech).
   */
  itemElement?: (identifier: string) => HTMLElement | null;
};
