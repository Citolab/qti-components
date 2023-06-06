import type { BaseType, Cardinality } from './ExpressionResult';
import type { VariableDeclaration } from './VariableDeclaration';

export class OutcomeVariable implements VariableDeclaration<number> {
  public identifier: string;
  public cardinality: Cardinality;
  public baseType: BaseType;
  public value: number = 0;
}
