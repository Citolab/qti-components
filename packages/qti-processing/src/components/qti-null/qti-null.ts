import { QtiExpression } from '@qti-components/base';

/**
 * @summary The qti-null expression returns the NULL value.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.null
 *
 * A simple expression that returns the NULL value. The null value is treated
 * as if it is of any desired base-type.
 */
export class QtiNull extends QtiExpression<null> {
  public override getResult(): null {
    return null;
  }
}

customElements.define('qti-null', QtiNull);
