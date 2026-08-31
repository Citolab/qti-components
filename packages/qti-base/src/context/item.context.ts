import { createContext } from '@lit/context';

import type { ItemContext } from './types/item.types';

export const itemContext = createContext<ItemContext>(Symbol('item'));
