import { QtiVariableDeclaration } from '../qti-variable-declaration';
import { ResponseVariable } from '../../qti-utilities/Variables';
import { BaseType, Cardinality } from '../../qti-utilities/ExpressionResult';
import { property } from 'lit/decorators.js';
import { QtiMapping } from '../../qti-response-processing/qti-expression/qti-mapping/qti-mapping';

export class QtiResponseDeclaration extends QtiVariableDeclaration {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType;

  @property({ type: String }) identifier: string;

  @property({ type: String }) cardinality: Cardinality;

  public override connectedCallback() {
    super.connectedCallback();

    const responseVariable: ResponseVariable = {
      baseType: this.baseType,
      identifier: this.identifier,
      correctResponse: this.correctResponse,
      cardinality: this.cardinality || 'single',
      mapping: this.mapping,
      value: null,
      type: 'response',
      candidateResponse: null
    };
    responseVariable.value = this.defaultValues(responseVariable);

    this.dispatchEvent(
      new CustomEvent('qti-register-variable', {
        bubbles: true,
        composed: true,
        detail: { variable: responseVariable }
      })
    );
  }

  private get correctResponse(): string | string[] {
    let result: string | string[];
    const correctResponse = this.querySelector('qti-correct-response');
    if (correctResponse) {
      const values = correctResponse.querySelectorAll('qti-value');
      if (this.cardinality === 'single' && values.length > 0) {
        result = values[0].textContent;
        values[0].remove();
      } else if (this.cardinality !== 'single') {
        result = [];
        for (let i = 0; i < values.length; i++) {
          result.push(values[i].textContent);
          values[i].remove();
        }
      }
    }
    return result;
  }

  private get mapping() {
    return this.querySelector('qti-mapping') as QtiMapping;
  }
}

customElements.define('qti-response-declaration', QtiResponseDeclaration);
