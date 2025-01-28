import { createContext } from '@lit/context';

export type ComputedItem = {
  identifier: string;
  href?: string;
  /* ------ */
  //   rawscore?: Readonly<string | string[]>; // not necessary for outside world
  //   score?: number; // not necessary for outside world
  //   completionStatus?: Readonly<string | string[]>; // not necessary for outside world
  //   categories?: string[]; // not necessary for outside world
  type?: 'info' | 'regular';
  active?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  completed?: boolean;
  index?: number;
  adaptive?: boolean;
  timeDependent?: boolean;
  title?: string;
  value?: Readonly<string | string[]>;
};

export type ComputedContext = {
  // testElement?: HTMLElement;
  testParts: {
    active?: boolean;
    identifier: string;
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
