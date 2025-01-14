import { html } from 'lit';
import type { QtiExpression } from '../../../../exports/qti-expression';
import { QtiRule } from '../qti-rule';

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
