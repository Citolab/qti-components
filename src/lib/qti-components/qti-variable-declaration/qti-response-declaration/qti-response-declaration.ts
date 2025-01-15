import { consume } from '@lit/context';
import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { BaseType, Cardinality } from '../../../exports/expression-result';
import type { ResponseVariable } from '../../../exports/variables';
import { itemContext } from '../../../exports/qti-assessment-item.context';
import type { QtiMapping } from '../../qti-response-processing/qti-expression/qti-mapping/qti-mapping';
import { QtiVariableDeclaration } from '../qti-variable-declaration';
import type { ItemContext } from '../../../exports/item.context';

@customElement('qti-response-declaration')
export class QtiResponseDeclaration extends QtiVariableDeclaration {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType;

  @property({ type: String }) identifier: string;

  @property({ type: String }) cardinality: Cardinality;

  @consume({ context: itemContext, subscribe: true })
  @state()
  public itemContext?: ItemContext;

  static styles = [
    css`
      :host {
        display: none;
      }
    `
  ];

  override render() {
    const value = this.itemContext?.variables.find(v => v.identifier === this.identifier)?.value;
    return html`${JSON.stringify(value, null, 2)}`;
  }

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
        result = values[0].textContent.trim();
        values[0].remove();
      } else if (this.cardinality !== 'single') {
        result = [];
        for (let i = 0; i < values.length; i++) {
          result.push(values[i].textContent.trim());
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

declare global {
  interface HTMLElementTagNameMap {
    'qti-response-declaration': QtiResponseDeclaration;
  }
}
