import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-repeat operator generates a container by repeating an expression.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#repeat
 *
 * Attributes 'number-repeats' determines the count of iterations.
 * Returns an ordered container filled with results of the evaluated sub-expressions.
 * Special cases: Returns NULL if number-repeats < 1; ignores evaluated NULL values.
 */
export class QtiRepeat extends QtiExpression<ResponseVariable[]> {
  @property({ type: String, attribute: 'number-repeats' }) numberRepeats: string = '';

  public override getResult(): ResponseVariable[] {
    const count = this.#resolveRepeatCount();
    if (count <= 0) {
      return [];
    }

    const expression = this.firstElementChild as QtiExpression<unknown> | null;
    if (!expression) {
      console.warn('qti-repeat: missing child expression');
      return [];
    }

    const results: ResponseVariable[] = [];
    for (let i = 0; i < count; i++) {
      const value = expression.calculate();
      const variable = this.#toResponseVariable(value);
      if (variable) {
        results.push(variable);
      }
    }

    return results;
  }

  #resolveRepeatCount(): number {
    if (!this.numberRepeats) {
      console.warn('qti-repeat: missing number-repeats attribute');
      return 0;
    }

    const numericCount = parseInt(this.numberRepeats, 10);
    if (!Number.isNaN(numericCount)) {
      return numericCount;
    }

    const identifier = this.numberRepeats;
    const variable = this.context?.variables?.find(v => v.identifier === identifier);
    if (!variable) {
      console.warn(`qti-repeat: unknown identifier "${identifier}"`);
      return 0;
    }

    const rawValue = Array.isArray(variable.value) ? variable.value[0] : variable.value;
    const resolvedCount = parseInt(rawValue?.toString() ?? '', 10);

    if (Number.isNaN(resolvedCount)) {
      console.warn(`qti-repeat: invalid repeat count from "${identifier}"`);
      return 0;
    }

    return resolvedCount;
  }

  #toResponseVariable(value: unknown): ResponseVariable | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number') {
      return {
        identifier: '',
        cardinality: 'single',
        baseType: Number.isInteger(value) ? 'integer' : 'float',
        value: value.toString(),
        type: 'response'
      } as ResponseVariable;
    }

    if (typeof value === 'string') {
      const numericValue = parseFloat(value);
      if (!Number.isNaN(numericValue)) {
        return {
          identifier: '',
          cardinality: 'single',
          baseType: Number.isInteger(numericValue) ? 'integer' : 'float',
          value: value.toString(),
          type: 'response'
        } as ResponseVariable;
      }
    }

    if (value && typeof value === 'object' && 'value' in (value as ResponseVariable)) {
      const responseValue = (value as ResponseVariable).value;
      return {
        identifier: '',
        cardinality: 'single',
        baseType: (value as ResponseVariable).baseType ?? 'string',
        value: responseValue !== null && responseValue !== undefined ? responseValue.toString() : null,
        type: 'response'
      } as ResponseVariable;
    }

    return {
      identifier: '',
      cardinality: 'single',
      baseType: 'string',
      value: value.toString(),
      type: 'response'
    } as ResponseVariable;
  }
}

customElements.define('qti-repeat', QtiRepeat);
