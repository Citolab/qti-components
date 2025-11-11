import type { VariableDeclaration } from '../lib/variables';

export interface ItemContext {
  identifier?: string;
  href?: string;
  variables?: ReadonlyArray<VariableDeclaration<string | string[] | null>>;
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
