import { createContext } from '@lit/context';

import type { ComputedItemContext } from './computed-item.context';

export type ComputedItem = ComputedItemContext & {
  //   rawscore?: Readonly<string | string[]>; // not necessary for outside world
  //   score?: number; // not necessary for outside world
  //   completionStatus?: Readonly<string | string[]>; // not necessary for outside world
  //   categories?: string[]; // not necessary for outside world
  type?: 'info' | 'regular';
  index?: number;
  active?: boolean;
};

export type ComputedContext = {
  // testElement?: HTMLElement;
  testParts: {
    active?: boolean;
    identifier: string;
    items: ComputedItem[];
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
