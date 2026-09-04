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

/** A qti-test-feedback that has become available to view (its atEnd outcome matched). */
export type AvailableFeedback = {
  identifier: string;
  /** Identifier of the enclosing qti-test-part, or null for test-root feedback. */
  partId: string | null;
};

export type ComputedContext = {
  view: View;
  identifier: string;
  title: string;
  /** atEnd feedbacks that are ready to show, surfaced for test-show-feedback. */
  availableFeedbacks?: AvailableFeedback[];
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
};
