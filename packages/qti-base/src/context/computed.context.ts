import { createContext } from '@lit/context';

import type { ComputedContext } from './types/computed.types';

export const computedContext = createContext<Readonly<ComputedContext>>(Symbol('computedContext'));
