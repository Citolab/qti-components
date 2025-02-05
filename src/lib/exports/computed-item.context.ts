import { createContext } from '@lit/context';

export type ComputedItemContext = {
  identifier: string;
  href?: string;
  correct?: boolean;
  incorrect?: boolean;
  completed?: boolean;
  adaptive?: boolean;
  timeDependent?: boolean;
  title?: string;
  value?: Readonly<string | string[]>;
};

export const computedItemContext = createContext<Readonly<ComputedItemContext>>(Symbol('computedItemContext'));
