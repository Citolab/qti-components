import { QtiMapping } from '../qti-response-processing/qti-expression/qti-mapping/qti-mapping';
import type { BaseType, Cardinality } from './expression-result';

export interface VariableDeclaration<T> {
  identifier: string;
  cardinality: Cardinality;
  baseType: BaseType;
  value: Readonly<T>;
  type: 'outcome' | 'response';
}

export interface OutcomeVariable extends VariableDeclaration<string | string[] | null> {
  // specific to outcome variables
  interpolationTable?: Map<number, number>;
}

export interface ResponseVariable extends VariableDeclaration<string | string[] | null> {
  // specific to response variables
  candidateResponse?: string | string[] | null;
  mapping?: QtiMapping;
  correctResponse?: string | string[] | null;
}
