import { convertNumberToUniversalFormat } from '@qti-components/base';

import { QtiRule } from '../qti-rule/qti-rule';

import type { QtiExpression, QtiExpressionBase, QtiRuleBase, ResponseVariable } from '@qti-components/base';

/**
 * Web component that processes `setTemplateValue` in QTI.
 */
export class QtiSetTemplateValue extends QtiRule {
  /**
   * Processes the QTI rule and dispatches a custom event with the computed template value.
   */
  public override process(): void {
    const templateIdentifier = this.getAttribute('identifier');

    if (!templateIdentifier) {
      console.warn('QtiSetTemplateValue: Missing "identifier" attribute.');
      return;
    }

    const expression = this.firstElementChild as QtiExpression<unknown> | null;

    if (!expression) {
      console.warn('QtiSetTemplateValue: No expression found.');
      return;
    }

    const rule = new QtiSetTemplateValueRule<unknown>(expression);
    const value = rule.process();

    this.dispatchEvent(
      new CustomEvent<{ templateIdentifier: string; value: string | string[] | null }>('qti-set-template-value', {
        bubbles: true,
        composed: true,
        detail: {
          templateIdentifier,
          value: this.#formatValue(value)
        }
      })
    );
  }

  /**
   * Formats the computed value before dispatching.
   * Ensures numbers are converted to a universal format.
   */
  #formatValue(value: unknown): string | string[] | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (Array.isArray(value)) {
      return value.map(item => convertNumberToUniversalFormat(this.#unwrapValue(item)));
    }

    return convertNumberToUniversalFormat(this.#unwrapValue(value));
  }

  #unwrapValue(value: unknown): string {
    if (value && typeof value === 'object' && 'value' in (value as ResponseVariable)) {
      const responseValue = (value as ResponseVariable).value;
      return responseValue !== null && responseValue !== undefined ? responseValue.toString() : '';
    }

    return value?.toString() ?? '';
  }
}

/**
 * Encapsulates the logic for processing QTI setTemplateValue expressions.
 */
export class QtiSetTemplateValueRule<T> implements QtiRuleBase {
  constructor(private expression: QtiExpressionBase<T>) {}

  /**
   * Evaluates the expression and returns its value.
   */
  process(): unknown {
    const value = this.expression.calculate() ?? null;

    if (value === null) {
      console.warn('QtiSetTemplateValueRule: Evaluated value is null.');
    }

    if (Array.isArray(value)) {
      return value.map(item => this.#unwrapResult(item));
    }

    return this.#unwrapResult(value);
  }

  #unwrapResult(value: unknown): unknown {
    if (value && typeof value === 'object' && 'value' in (value as ResponseVariable)) {
      return (value as ResponseVariable).value;
    }

    return value;
  }
}

customElements.define('qti-set-template-value', QtiSetTemplateValue);
