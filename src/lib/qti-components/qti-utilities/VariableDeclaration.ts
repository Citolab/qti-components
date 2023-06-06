import type { BaseType, Cardinality } from './ExpressionResult';

export interface VariableDeclaration<T> {
  identifier: string;
  cardinality: Cardinality;
  baseType: BaseType;
  value: T;
}
