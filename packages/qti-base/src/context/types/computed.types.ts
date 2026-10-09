import type { View } from '../session.context';
import type { ComputedItemContext } from './computed-item.types';

export type ComputedItem = ComputedItemContext & {
  categories?: string[]; // not necessary for outside world
  type?: 'info' | 'regular';
  index?: number;
  active?: boolean;
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
  identifier: string;
  title: string;
  testParts: {
    active?: boolean;
    identifier: string;
    navigationMode: 'linear' | 'nonlinear';
    submissionMode: 'individual' | 'simultaneous';
    allowSkipping?: boolean;
    sections: {
      active?: boolean;
      identifier: string;
      title: string;
      completed?: boolean;
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
