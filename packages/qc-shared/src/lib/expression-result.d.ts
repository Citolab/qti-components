export interface directedPair {
    destination: string;
    source: string;
}
export interface ResponseInteraction {
    responseIdentifier: string;
    response: string | string[];
}
export interface Calculate {
    calculate: () => string | string[];
}
export type float = number;
export type integer = number;
export type BaseType = 'boolean' | 'directedPair' | 'duration' | 'float' | 'integer' | 'string' | 'identifier' | 'pair' | 'record';
export type Multiple = string | string[][];
export type Ordered = string | string[][];
export type Cardinality = 'multiple' | 'ordered' | 'single' | 'record';
