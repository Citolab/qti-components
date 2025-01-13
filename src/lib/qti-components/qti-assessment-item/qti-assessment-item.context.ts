import { createContext } from '@lit/context';
import type { ItemContext } from '../internal/item.context';

export const itemContext = createContext<ItemContext>(Symbol('item'));
