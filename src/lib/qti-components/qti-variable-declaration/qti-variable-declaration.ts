import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { VariableDeclaration } from '../../exports/variables';

@customElement('qti-variabledeclaration')
export class QtiVariableDeclaration extends LitElement {
  override render() {
    return html`<slot></slot>`;
  }

  protected defaultValues(variable: VariableDeclaration<string | string[] | null>) {
    const htmlValues = Array.from(this.querySelectorAll('qti-default-value > qti-value'));

    if (htmlValues.length === 0) {
      return null;
    }

    const defaultValues = htmlValues.map(n => n.innerHTML.trim());
    if (defaultValues.length > 1 || variable.cardinality === 'multiple' || variable.cardinality === 'ordered') {
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
