import { html, LitElement } from 'lit';
import { VariableDeclaration } from '../qti-utilities/VariableDeclaration';

export class QtiVariableDeclaration extends LitElement {
  override render() {
    return html``;
  }

  protected defaultValues(variable: VariableDeclaration<string | string[] | null>) {
    const htmlValues = Array.from(this.querySelectorAll('qti-default-value > qti-value'));
    if (htmlValues.length === 0 && (variable.cardinality === 'multiple' || variable.cardinality === 'ordered')) {
      return [];
    }
    if (htmlValues.length === 0) {
      return null;
    }

    const defaultValues = htmlValues.map(n => n.innerHTML);
    if (defaultValues.length > 1 || variable.cardinality === 'multiple' || variable.cardinality === 'ordered') {
      return defaultValues;
    }
    return defaultValues[0];
  }
}

customElements.define('qti-variabledeclaration', QtiVariableDeclaration);
