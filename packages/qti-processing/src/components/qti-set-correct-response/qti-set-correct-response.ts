import { convertNumberToUniversalFormat } from '@qti-components/base';

import { QtiRule } from '../qti-rule/qti-rule';

import type { QtiExpression, QtiExpressionBase, QtiRuleBase, ResponseVariable } from '@qti-components/base';

/**
 * Web component that processes `setCorrectResponse` in QTI.
 */
export class QtiSetCorrectResponse extends QtiRule {
  /**
   * Processes the QTI rule and dispatches a custom event with the computed correct response value.
   */
  public override process(): void {
    const responseIdentifier = this.getAttribute('identifier');

    if (!responseIdentifier) {
      console.warn('QtiSetCorrectResponse: Missing "identifier" attribute.');
      return;
    }

    const expression = this.firstElementChild as QtiExpression<unknown> | null;

    if (!expression) {
      console.warn('QtiSetCorrectResponse: No expression found.');
      return;
    }

    const rule = new QtiSetCorrectResponseRule<unknown>(expression);
    const value = rule.process();

    this.dispatchEvent(
      new CustomEvent<{ responseIdentifier: string; value: string | string[] | null }>('qti-set-correct-response', {
        bubbles: true,
        composed: true,
        detail: {
          responseIdentifier,
          value: this.#formatValue(value)
        }
      })
    );
  }

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
 * Encapsulates the logic for processing QTI setCorrectResponse expressions.
 */
export class QtiSetCorrectResponseRule<T> implements QtiRuleBase {
  constructor(private expression: QtiExpressionBase<T>) {}

  /**
   * Evaluates the expression and returns its value.
   */
  process(): unknown {
    const value = this.expression.calculate() ?? null;

    if (value === null) {
      console.warn('QtiSetCorrectResponseRule: Evaluated value is null.');
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

customElements.define('qti-set-correct-response', QtiSetCorrectResponse);
