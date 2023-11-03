import { convertNumberToUniveralFormat } from '../../../internal/utils';
import { QtiExpression } from '../../qti-expression/qti-expression';
import { QtiRule } from '../qti-rule';

export class QtiSetOutcomeValue extends QtiRule {
  public override process() {
    const outcomeIdentifier = this.getAttribute('identifier');
    const expression = this.firstElementChild as QtiExpression<string>;

    const value = expression ? expression.calculate() : null;

    if (value === null || value === undefined) {
      console.warn('setOutcomeValue: value is null or undefined');
      return;
    }

    this.dispatchEvent(
      new CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>('qti-set-outcome-value', {
        bubbles: true,
        composed: true,
        detail: {
          outcomeIdentifier,
          value: Array.isArray(value)
            ? value.map((v: string) => convertNumberToUniveralFormat(v))
            : convertNumberToUniveralFormat(value)
        }
      })
    );
  }
}

customElements.define('qti-set-outcome-value', QtiSetOutcomeValue);
