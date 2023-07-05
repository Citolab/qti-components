import type { BaseType, Cardinality } from './ExpressionResult';
import type { VariableDeclaration } from './VariableDeclaration';

export class OutcomeVariable implements VariableDeclaration<string | string[] | null> {
  public identifier: string;
  public cardinality: Cardinality;
  public baseType: BaseType;
  public value: string | string[] | null = null;
}
