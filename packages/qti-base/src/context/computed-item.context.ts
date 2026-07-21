import { createContext } from '@lit/context';

import type { ComputedItemContext } from './types/computed-item.types';

export const computedItemContext = createContext<Readonly<ComputedItemContext>>(Symbol('computedItemContext'));
