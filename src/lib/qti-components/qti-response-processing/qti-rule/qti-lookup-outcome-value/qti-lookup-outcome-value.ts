import { property } from 'lit/decorators.js';

import { convertNumberToUniversalFormat } from '../../../internal/utils';
import { QtiRule } from '../qti-rule';

import type { QtiExpression } from '../../../../exports/qti-expression';
import type { OutcomeVariable } from '../../../../exports/variables';

/**
 * The lookupOutcomeValue rule sets the value of an outcome variable to the value obtained
 * by looking up the value of the associated expression in the lookupTable associated
 * with the outcome's declaration.
 */
export class QtiLookupOutcomeValue extends QtiRule {
  @property({ type: String }) identifier: string;

  get childExpression(): QtiExpression<string> {
    return this.firstElementChild as QtiExpression<string>;
  }

  public override process(): number {
    const identifier = this.getAttribute('identifier');
    const outcomeVariable = this.closest('qti-assessment-item').getVariable(identifier) as OutcomeVariable;
    let value;
    if (outcomeVariable.interpolationTable) {
      value = outcomeVariable.interpolationTable.get(parseInt(this.childExpression.calculate()));
    }
    if (value === null || value === undefined) {
      console.warn('lookupOutcomeValue: value is null or undefined');
      return 0;
    }
    this.dispatchEvent(
      new CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>('qti-set-outcome-value', {
        bubbles: true,
        composed: true,
        detail: {
          outcomeIdentifier: this.identifier,
          value: convertNumberToUniversalFormat(value)
        }
      })
    );
    return value;
  }
}
customElements.define('qti-lookup-outcome-value', QtiLookupOutcomeValue);

declare global {
  interface HTMLElementTagNameMap {
    'qti-lookup-outcome-value': QtiLookupOutcomeValue;
  }
}
