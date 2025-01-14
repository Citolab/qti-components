import { QtiExpression } from '../../../../exports/qti-expression';

export class QtiVariable extends QtiExpression<string | string[]> {
  public override getResult() {
    const identifier = this.getAttribute('identifier');
    const result = this.context.variables.find(v => v.identifier === identifier).value;
    return result;
  }
}

customElements.define('qti-variable', QtiVariable);
