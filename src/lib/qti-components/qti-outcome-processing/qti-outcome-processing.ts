import { css, html, LitElement, PropertyValueMap } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Calculate, QtiRule, QtiRuleBase } from '..';

@customElement('qti-outcome-processing')
export class QtiOutcomeProcessing extends LitElement {
  static styles = [
    css`
      :host {
        display: none;
      }
    `
  ];

  override render() {
    return html`<slot></slot>`;
  }

  public process() {
    const logic = new QtiOutcomeProcessingProcessor();
    const rules = [...this.children] as QtiRule[];
    logic.process(rules);
  }
}

export class QtiOutcomeProcessingProcessor {
  public process(rules: QtiRuleBase[]) {
    for (const rule of rules) {
      rule.process();
    }
  }
}
