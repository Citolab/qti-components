import { createContext } from '@lit/context';

import type { ItemContext } from './item.context';

export const itemContext = createContext<ItemContext>(Symbol('item'));
