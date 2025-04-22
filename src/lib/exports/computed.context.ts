import { createContext } from '@lit/context';

import type { View } from '../qti-test/core/mixins/test-view.mixin';
import type { ComputedItemContext } from './computed-item.context';

export type ComputedItem = ComputedItemContext & {
  categories?: string[];
  type?: 'info' | 'regular';
  index?: number;
  active?: boolean;
  itemDoc?: Document;
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
    sections: {
      active?: boolean;
      identifier: string;
      title: string;
      completed?: boolean;
      items: ComputedItem[];
    }[];
  }[];
};

export const computedContext = createContext<Readonly<ComputedContext>>(Symbol('computedContext'));
