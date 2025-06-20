import { createContext } from '@lit/context';

import type { VariableDeclaration } from './variables';

export type ComputedItemContext = {
  identifier: string;
  href?: string;
  correct?: boolean;
  incorrect?: boolean;
  completed?: boolean;
  adaptive?: boolean;
  timeDependent?: boolean;
  title?: string;
  label?: string;
  score?: number;
  maxScore?: number;
  completionStatus?: string;
  variables: ReadonlyArray<VariableDeclaration<string | string[] | null>>;
};

export const computedItemContext = createContext<Readonly<ComputedItemContext>>(Symbol('computedItemContext'));
