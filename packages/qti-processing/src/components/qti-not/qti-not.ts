import { html } from 'lit';

import { QtiExpression } from '@qti-components/base';

/**
 * @summary The qti-not operator performs logical negation.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#not
 *
 * Takes exactly 1 sub-expression with base-type boolean and single cardinality.
 * Returns true if sub-expression is false, and false if sub-expression is true.
 * Special cases: Returns NULL if sub-expression is NULL.
 */
export class QtiNot extends QtiExpression<boolean> {
  override render() {
    return html`${super.render()}`;
  }

  public override getResult() {
    const expression = this.firstElementChild as QtiExpression<boolean>;
    const result = expression.calculate() as boolean;
    return !result;
  }
}

customElements.define('qti-not', QtiNot);
