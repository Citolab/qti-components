import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

export class QtiPatternMatch extends QtiExpression<boolean | null> {
  @property({ type: String }) pattern = '';

  public override getResult(): boolean | null {
    const variables = this.getVariables() as ResponseVariable[];

    if (variables.length !== 1) {
      console.error('qti-pattern-match requires exactly one child expression');
      return null;
    }

    if (!this.pattern) {
      console.error('qti-pattern-match requires a pattern attribute');
      return null;
    }

    const variable = variables[0];
    if (variable.cardinality !== 'single' || Array.isArray(variable.value)) {
      console.error('qti-pattern-match requires single cardinality');
      return null;
    }
    if (variable.value === null || variable.value === undefined) {
      return null;
    }

    try {
      return new RegExp(this.pattern).test(variable.value.toString());
    } catch (error) {
      console.error('qti-pattern-match requires a valid regular expression', error);
      return null;
    }
  }
}

customElements.define('qti-pattern-match', QtiPatternMatch);
