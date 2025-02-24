import { QtiExpression } from '../../../../exports/qti-expression';

export class QtiRandom extends QtiExpression<string> {
  public override getResult() {
    const values = this.getVariables();
    // console.log(values);

    if (values.length === 1) {
      const value = values[0].value;
      if (Array.isArray(value)) {
        const randomIndex = Math.floor(Math.random() * value.length);
        return value[randomIndex];
      }
      return value;
    }
    console.error('unexpected number of children in match');
    return null;
  }
}

customElements.define('qti-random', QtiRandom);
