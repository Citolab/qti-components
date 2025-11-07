import { html } from 'lit';

import { QtiRule } from '../qti-rule/qti-rule';

import type { QtiExpression } from '@qti-components/base';

export class QtiResponseCondition extends QtiRule {
  override render() {
    return html`<slot></slot>`;
  }

  public override process() {
    const branches = [...this.children] as QtiExpression<any>[];

    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];

      if (branch.calculate()) {
        (branch as unknown as QtiRule).process();

        return;
      }
    }
  }
}

customElements.define('qti-response-condition', QtiResponseCondition);
