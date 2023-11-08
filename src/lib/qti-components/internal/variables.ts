import { QtiMapping } from '../qti-response-processing/qti-expression/qti-mapping/qti-mapping';
import type { BaseType, Cardinality } from './expression-result';

export interface VariableValue<T> {
  identifier: string;
  value: Readonly<T>;
  type: 'outcome' | 'response';
}

export interface VariableDeclaration<T> extends VariableValue<T> {
  cardinality: Cardinality;
  baseType: BaseType;
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
