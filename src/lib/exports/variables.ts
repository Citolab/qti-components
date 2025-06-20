import type { QtiAreaMapping, QtiMapping } from '../qti-components';
import type { BaseType, Cardinality } from './expression-result';

export interface VariableValue<T> {
  identifier: string;
  value: Readonly<T>;
  type: 'outcome' | 'response' | 'context';
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
