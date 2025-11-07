import { convertNumberToUniversalFormat } from '@qti-components/shared';

import { QtiRule } from '../qti-rule';

import type { ResponseVariable } from '@qti-components/shared';
import type { QtiExpression, QtiExpressionBase } from '@qti-components/shared';
import type { QtiRuleBase } from '@qti-components/shared';

/**
 * Web component that processes `setOutcomeValue` in QTI.
 */
export class QtiSetOutcomeValue extends QtiRule {
  /**
   * Processes the QTI rule and dispatches a custom event with the computed outcome value.
   */
  public override process(): void {
    const outcomeIdentifier = this.getAttribute('identifier');

    if (!outcomeIdentifier) {
      console.warn('QtiSetOutcomeValue: Missing "identifier" attribute.');
      return;
    }

    const expression = this.firstElementChild as QtiExpression<string | ResponseVariable[]> | null;

    if (!expression) {
      console.warn('QtiSetOutcomeValue: No expression found.');
      return;
    }

    const rule = new QtiSetOutcomeValueRule<string | ResponseVariable[] | null>(expression);
    const value = rule.process();

    this.dispatchEvent(
      new CustomEvent<{ outcomeIdentifier: string; value: string | string[] | null }>('qti-set-outcome-value', {
        bubbles: true,
        composed: true,
        detail: {
          outcomeIdentifier,
          value: this.formatValue(value)
        }
      })
    );
  }

  /**
   * Formats the computed value before dispatching.
   * Ensures numbers are converted to a universal format.
   */
  private formatValue(value: string | string[] | null): string | string[] | null {
    if (Array.isArray(value)) {
      return value.map(convertNumberToUniversalFormat);
    }
    return value !== null ? convertNumberToUniversalFormat(value) : null;
  }
}

/**
 * Encapsulates the logic for processing QTI setOutcomeValue expressions.
 */
export class QtiSetOutcomeValueRule<T> implements QtiRuleBase {
  constructor(private expression: QtiExpressionBase<T>) {}

  /**
   * Evaluates the expression and returns its value.
   */
  process(): string | string[] | null {
    const value = (this.expression.calculate() ?? null) as unknown as string | string[] | null;

    if (value === null) {
      console.warn('QtiSetOutcomeValueRule: Evaluated value is null.');
    }

    return Array.isArray(value) ? (value as any).map((v: { value: any }) => (v.value ? v.value : v)) : value;
  }
}

// Define the custom element
customElements.define('qti-set-outcome-value', QtiSetOutcomeValue);
