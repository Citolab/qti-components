import { QtiExitTestSignal } from '@qti-components/base';

import { QtiRule } from '../qti-rule/qti-rule';

/**
 * @summary The qti-exit-test rule ends the outcome processing of a test.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.exit-test
 *
 * The test-level counterpart of `qti-exit-response`. No rule after it runs, at
 * any depth, and the test outcomes already set are kept.
 */
export class QtiExitTest extends QtiRule {
  public override process(): never {
    throw new QtiExitTestSignal();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-exit-test': QtiExitTest;
  }
}
