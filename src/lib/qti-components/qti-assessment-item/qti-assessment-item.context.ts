import { createContext } from '@lit/context';
import { VariableDeclaration } from '../internal/variables';

export interface ItemContext {
  href?: string;
  identifier: string;
  variables: ReadonlyArray<VariableDeclaration<string | string[]>>;
}

export const itemContextVariables = [
  {
    identifier: 'completionStatus',
    cardinality: 'single',
    baseType: 'string',
    value: 'unknown',
    type: 'outcome'
  },
  {
    identifier: 'numAttempts',
    cardinality: 'single',
    baseType: 'integer',
    value: '0',
    type: 'response'
  }
] as VariableDeclaration<string | string[]>[];

export const itemContext = createContext<ItemContext>('item');
