import { createContext } from '@lit/context';
import { VariableDeclaration } from '../internal/variables';

export interface ItemContext {
  href?: string;
  identifier: string;
  variables: ReadonlyArray<VariableDeclaration<string | string[]>>;
}

export const itemContext = createContext<ItemContext>('item');
