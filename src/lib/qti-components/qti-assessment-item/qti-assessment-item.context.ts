import { createContext } from '@lit-labs/context';
import { OutcomeVariable, ResponseVariable, VariableDeclaration } from '../qti-utilities/Variables';

export interface Item {
  variables: ReadonlyArray<VariableDeclaration<string | string[]>>;
}

export const itemContext = createContext<Item>('item');
