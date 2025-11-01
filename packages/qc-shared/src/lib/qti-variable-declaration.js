import { html, LitElement } from 'lit';
export class QtiVariableDeclaration extends LitElement {
    render() {
        return html `<slot></slot>`;
    }
    defaultValues(cardinality) {
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
//# sourceMappingURL=qti-variable-declaration.js.map