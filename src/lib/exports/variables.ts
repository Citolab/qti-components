import type { QtiAreaMapping } from '../qti-components/qti-response-processing/qti-expression/qti-area-mapping/qti-area-mapping';
import type { QtiMapping } from '../qti-components/qti-response-processing/qti-expression/qti-mapping/qti-mapping';
import type { BaseType, Cardinality } from './expression-result';

export interface VariableValue<T> {
  identifier: string;
  value: Readonly<T>;
  type: 'outcome' | 'response';
}

export interface VariableDeclaration<T> extends VariableValue<T> {
  cardinality?: Cardinality;
  baseType?: BaseType;
}

export interface OutcomeVariable extends VariableDeclaration<string | string[] | null> {
  // specific to outcome variables
  interpolationTable?: Map<number, number>;
  externalScored?: 'human' | 'externalMachine' | null;
}

export interface ResponseVariable extends VariableDeclaration<string | string[] | null> {
  // specific to response variables
  candidateResponse?: string | string[] | null;
  mapping?: QtiMapping;
  areaMapping?: QtiAreaMapping; // Optional property for area mappings
  correctResponse?: string | string[] | null;
}
