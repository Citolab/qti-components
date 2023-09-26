import { QtiMapping } from '../qti-responseprocessing/qti-expression/qti-mapping/qti-mapping';
import type { BaseType, Cardinality } from './ExpressionResult';

export interface VariableDeclaration<T> {
  identifier: string;
  cardinality: Cardinality;
  baseType: BaseType;
  value: Readonly<T>;
  type: 'outcome' | 'response';
}

// temporary
export interface ResultVariable {
  cardinality: Cardinality;
  baseType: BaseType;
  result: number | boolean | string | (number | boolean | string)[];
}

// fixed in the declarations
export class OutcomeVariable implements VariableDeclaration<string | string[] | null> {
  public identifier: string;
  public cardinality: Cardinality;
  public baseType: BaseType;
  public value: string | string[] | null = null;
  public type: 'outcome' | 'response' = 'outcome';
}

export class ResponseVariable implements VariableDeclaration<string | string[] | null> {
  public identifier: string;
  public cardinality: Cardinality;
  public baseType: BaseType;
  public value: string | string[] | null = null;

  // public candidateResponse: string | string[] | null = null;
  public mapping: QtiMapping;
  public correctResponse: string | string[] | null = null;
  public type: 'outcome' | 'response' = 'response';
}
