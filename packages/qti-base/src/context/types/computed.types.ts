import type { View } from '../session.context';
import type { ComputedItemContext } from './computed-item.types';

export type ComputedItem = ComputedItemContext & {
  categories?: string[]; // not necessary for outside world
  type?: 'info' | 'regular';
  index?: number;
  active?: boolean;
  allowSkipping?: boolean;
  maxAttempts?: number;
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
};
