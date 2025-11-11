import type { BaseType, Cardinality } from './expression-result';

export type QtiAreaMapping = {
  defaultValue: number;
  lowerBound?: number;
  upperBound?: number;
  areaMapEntries: QtiAreaMapEntry[];
};

export type QtiAreaMapEntry = {
  shape: areaShape;
  coords: string;
  mappedValue: number;
  defaultValue: number;
};

export type QtiMapping = {
  defaultValue: number;
  lowerBound?: number;
  upperBound?: number;
  mapEntries: QtiMapEntry[];
};

export type QtiMapEntry = { mapKey: string; mappedValue: number; caseSensitive: boolean };

export type areaShape = 'default' | 'circle' | 'rect' | 'ellipse' | 'poly';
export interface VariableValue<T> {
  identifier: string;
  value: Readonly<T>;
  defaultValue?: T | null;
  type: 'outcome' | 'response' | 'context' | 'template';
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

export interface TemplateVariable extends VariableDeclaration<string | string[] | number | boolean | null> {
  type: 'template';
  mathVariable?: boolean;
  paramVariable?: boolean;
}
