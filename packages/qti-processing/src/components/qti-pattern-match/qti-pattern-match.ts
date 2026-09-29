import { property } from 'lit/decorators.js';

import { QtiExpression } from '@qti-components/base';

import type { ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-pattern-match operator checks a string against a regular expression.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#patternMatch
 *
 * Takes 1 string sub-expression; 'pattern' attribute contains the regex.
 * Returns true if the string matches the pattern, false otherwise.
 * Special cases: Returns NULL if sub-expression is NULL.
 */
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

    const anchored = this.#compile();
    if (!anchored) {
      return null;
    }
    return anchored.test(variable.value.toString());
  }

  /**
   * XML Schema pattern semantics: the pattern has to match the *whole* value,
   * not appear somewhere inside it. Without the anchors a pattern like `[0-9]+`
   * accepts "abc123". The pattern is wrapped in a group so a top-level `|`
   * cannot escape them — `a|b` has to anchor as `^(?:a|b)$`.
   *
   * Compiled with the unicode flag first, because XML Schema allows `\p{L}`
   * category escapes and those only mean anything under `u`. That flag also
   * rejects escapes JavaScript otherwise tolerates, so a pattern it refuses is
   * retried without it rather than failing the whole comparison.
   */
  #compile(): RegExp | null {
    const source = `^(?:${this.pattern})$`;
    try {
      return new RegExp(source, 'u');
    } catch {
      try {
        return new RegExp(source);
      } catch (error) {
        console.error('qti-pattern-match requires a valid regular expression', error);
        return null;
      }
    }
  }
}
