import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { QtiRuleBase } from '@qti-components/base';

@customElement('qti-outcome-processing')
export class QtiOutcomeProcessing extends LitElement {
  static override styles = [
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
    const rules = [...this.children] as unknown as QtiRuleBase[];
    logic.process(rules);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-outcome-processing': QtiOutcomeProcessing;
  }
}

export class QtiOutcomeProcessingProcessor {
  public process(rules: QtiRuleBase[]) {
    for (const rule of rules) {
      rule.process();
    }
  }
}
