import type { View } from '../session.context';
import type { ComputedItemContext } from './computed-item.types';

export type ComputedItem = ComputedItemContext & {
  categories?: string[]; // not necessary for outside world
  type?: 'info' | 'regular';
  /** The item's number in the test's document order, counting no info items; null for an info item. */
  index?: number;
  active?: boolean;
  /**
   * `qti-item-session-control`, resolved per attribute: each comes from the closest level that
   * declares it (item-ref, enclosing sections, test part), its QTI default only when none does.
   */
  allowSkipping?: boolean;
  maxAttempts?: number;
  showFeedback?: boolean;
  showSolution?: boolean;
  numAttempts?: number;
  valid?: boolean;
  isDefaultResponse?: boolean;
  done?: boolean;
  /** Last *ended attempt* reached the optimal outcome (best achievable score / correct response). */
  optimal?: boolean;
};

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
      navigationMode: 'linear' | 'nonlinear';
      submissionMode: 'individual' | 'simultaneous';
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
