export interface directedPair {
  destination: string;
  source: string;
}

// PK: EVENT: response from a INTERACTION_RESPONSE qti-interaction
export interface ResponseInteraction {
  responseIdentifier: string;
  response: string | string[];
}

export interface Calculate {
  calculate: () => string | string[];
}

export type float = number;
export type integer = number;

// export type string|string[] = string | string[];

export type BaseType = 'boolean' | 'directedPair' | 'float' | 'integer' | 'string' | 'identifier' | 'pair';

export type Multiple = string | string[][];
export type Ordered = string | string[][];

export type Cardinality = 'multiple' | 'ordered' | 'single';
