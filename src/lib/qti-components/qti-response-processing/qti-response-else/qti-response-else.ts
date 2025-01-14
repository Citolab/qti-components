import { LitElement, html } from 'lit';
import type { QtiRule } from '../qti-rule/qti-rule';

export class QtiResponseElse extends LitElement {
  override render() {
    return html`<slot></slot>`;
  }

  public calculate() {
    return true;
  }

  public getSubRules(): QtiRule[] {
    return [...this.children] as QtiRule[];
  }

  public process() {
    const subRules = this.getSubRules();
    for (let i = 0; i < subRules.length; i++) {
      const subRule = subRules[i];
      subRule.process();
    }
  }
}

customElements.define('qti-response-else', QtiResponseElse);
