import { createContext } from '@lit-labs/context';
import { VariableDeclaration } from '../qti-utilities/Variables';

export interface ItemContext {
  identifier: string;
  variables: ReadonlyArray<VariableDeclaration<string | string[]>>;
}

export const itemContext = createContext<ItemContext>('item');