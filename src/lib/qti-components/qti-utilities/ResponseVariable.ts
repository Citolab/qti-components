import { QtiMapping } from "../qti-responseprocessing/qti-expression/qti-mapping/qti-mapping";
import { BaseType } from "./ExpressionResult";
import type { Cardinality } from "./ExpressionResult";
import type { VariableDeclaration } from "./VariableDeclaration";

export class ResponseVariable implements VariableDeclaration<string|string[]> {
  private _candidateResponse: string | string[];
  private _mapping: QtiMapping;
  private _correctResponse: string | string[];
  private _cardinality: Cardinality;
  private _identifier: string;
  private _basetype: BaseType = 'string';
  private _qtiVariable: string | string[];

  constructor({
    mapping,
    correctResponse,
    cardinality,
    baseType,
    identifier,
  }: {
    mapping: QtiMapping;
    correctResponse: string|string[];
    cardinality: Cardinality;
    baseType: BaseType;
    identifier: string;
  }) {
    this._mapping = mapping;
    this._correctResponse = correctResponse;
    this._cardinality = cardinality;
    this._basetype = baseType;
    this._identifier = identifier;
  }

  get mapping() {
    return this._mapping;
  }
  get correctResponse() {
    return this._correctResponse;
  }
  get cardinality() {
    return this._cardinality;
  }
  get baseType() {
    return this._basetype;
  }
  get identifier() {
    return this._identifier;
  }
  get value(): string | string[] {
    return this._candidateResponse;
  }
  set value(val: string | string[]) {
    this._candidateResponse = val;
  }
}
