import { QtiRule } from '../qti-rule/qti-rule';

import type { QtiRuleBase } from '@qti-components/base';

/**
 * @summary The qti-response-processing-fragment groups rules for reuse.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.response-processing-fragment
 *
 * A fragment is a transparent container: its rules run in place, in document
 * order, exactly as if they had been written where the fragment sits.
 *
 * A fragment held in a separate file is not pulled in, because `qti-include` is
 * not resolved — only the rules authored inside this element run.
 */
export class QtiResponseProcessingFragment extends QtiRule {
  public override process() {
    for (const rule of [...this.children] as unknown as QtiRuleBase[]) {
      rule.process();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-response-processing-fragment': QtiResponseProcessingFragment;
  }
}
