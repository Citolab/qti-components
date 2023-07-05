import { QtiVariableDeclaration } from '../qti-variabledeclaration';
import { ResponseVariable } from '../../qti-utilities/ResponseVariable';
import { BaseType, Cardinality } from '../../qti-utilities/ExpressionResult';
import { property } from 'lit/decorators.js';
import { QtiMapping } from '../../qti-responseprocessing/qti-expression/qti-mapping/qti-mapping';

export class QtiResponseDeclaration extends QtiVariableDeclaration {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType;

  @property({ type: String }) identifier: string;

  @property({ type: String }) cardinality: Cardinality;

  public override connectedCallback() {
    super.connectedCallback();

    const responseVariable = new ResponseVariable();

    responseVariable.baseType = this.baseType;
    responseVariable.identifier = this.identifier;
    responseVariable.correctResponse = this.correctResponse;
    responseVariable.cardinality = this.cardinality || 'single';
    responseVariable.mapping = this.mapping;
    responseVariable.value = this.defaultValues(responseVariable);

    // this.emit("qti-register-variable", { detail: { variable: responseVariable } });
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
