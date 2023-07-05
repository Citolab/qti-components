import { QtiMapping } from '../qti-responseprocessing/qti-expression/qti-mapping/qti-mapping';
import { BaseType } from './ExpressionResult';
import type { Cardinality } from './ExpressionResult';
import type { VariableDeclaration } from './VariableDeclaration';

export class ResponseVariable implements VariableDeclaration<string | string[] | null> {
  public identifier: string;
  public cardinality: Cardinality;
  public baseType: BaseType;
  public value: string | string[] | null = null;

  public candidateResponse: string | string[] | null = null;
  public mapping: QtiMapping;
  public correctResponse: string | string[] | null = null;
}
