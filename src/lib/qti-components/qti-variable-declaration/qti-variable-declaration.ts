import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { Cardinality } from '../../exports/expression-result';

@customElement('qti-variabledeclaration')
export class QtiVariableDeclaration extends LitElement {
  override render() {
    return html`<slot></slot>`;
  }

  protected defaultValues(cardinality: Cardinality) {
    const htmlValues = Array.from(this.querySelectorAll('qti-default-value > qti-value'));

    if (htmlValues.length === 0) {
      return null;
    }

    const defaultValues = htmlValues.map(n => n.innerHTML.trim());
    if (defaultValues.length > 1 || cardinality === 'multiple' || cardinality === 'ordered') {
      return defaultValues;
    }
    return defaultValues[0];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-variabledeclaration': QtiVariableDeclaration;
  }
}
