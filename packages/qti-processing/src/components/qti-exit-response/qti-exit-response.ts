import { QtiExitResponseSignal } from '@qti-components/base';

import { QtiRule } from '../qti-rule/qti-rule';

/**
 * @summary The qti-exit-response rule ends the response processing of an attempt.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.exit-response
 *
 * No rule after it runs, at any depth. The outcomes already set are kept: a
 * `qti-set-outcome-value` writes as it is processed, so everything before the
 * exit has landed by the time this throws.
 */
export class QtiExitResponse extends QtiRule {
  public override process(): never {
    throw new QtiExitResponseSignal();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-exit-response': QtiExitResponse;
  }
}
