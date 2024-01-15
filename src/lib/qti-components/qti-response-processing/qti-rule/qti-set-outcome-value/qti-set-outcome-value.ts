import { convertNumberToUniveralFormat } from '../../../internal/utils';
import { QtiExpression, QtiExpressionBase } from '../../qti-expression/qti-expression';
import { QtiRule, QtiRuleBase } from '../qti-rule';

export class QtiSetOutcomeValue extends QtiRule {
  public override process() {
    const outcomeIdentifier = this.getAttribute('identifier');

    const expression = this.firstElementChild as QtiExpression<string>;

    const rule = new QtiSetOutcomeValueRule(expression);
    const value = rule.process();
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

export class QtiSetOutcomeValueRule<T> implements QtiRuleBase {
  constructor(private expression: QtiExpressionBase<T>) {}

  process(): any {
    const value = this.expression ? this.expression.calculate() : null;

    if (value === null || value === undefined) {
      console.warn('setOutcomeValue: value is null or undefined');
      return;
    }
    return value;
  }
}

customElements.define('qti-set-outcome-value', QtiSetOutcomeValue);
