import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import type { QtiRule, QtiRuleBase } from '@qti-components/shared';

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
    const rules = [...this.children] as QtiRule[];
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
