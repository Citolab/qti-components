import { html, LitElement } from 'lit';

import type { Cardinality } from '../../../../src/lib/exports/expression-result';

export abstract class QtiVariableDeclaration extends LitElement {
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
