import { property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { convertNumberToUniversalFormat } from '@qti-components/base';
import { itemContext } from '@qti-components/base';

import { QtiRule } from '../qti-rule';

import type { QtiExpression } from '@qti-components/base';
import type { OutcomeVariable } from '@qti-components/base';
import type { ItemContext } from '@qti-components/base';

/**
 * The lookupOutcomeValue rule sets the value of an outcome variable to the value obtained
 * by looking up the value of the associated expression in the lookupTable associated
 * with the outcome's declaration.
 */
export class QtiLookupOutcomeValue extends QtiRule {
  @property({ type: String }) identifier: string;

  @consume({ context: itemContext, subscribe: true })
  @state()
  protected context?: ItemContext;

  get childExpression(): QtiExpression<string> {
    return this.firstElementChild as QtiExpression<string>;
  }

  public override process(): number {
    const identifier = this.getAttribute('identifier');

    const outcomeVariable: OutcomeVariable | null =
      this.context.variables.find(v => v.identifier === identifier) || null;

    let value;
    if (outcomeVariable.interpolationTable) {
      value = outcomeVariable.interpolationTable.get(parseFloat(this.childExpression.calculate()));
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
