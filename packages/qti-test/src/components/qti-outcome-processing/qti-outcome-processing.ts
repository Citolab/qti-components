import { css, html, LitElement } from 'lit';

import { QtiExitTestSignal } from '@qti-components/base';

import type { QtiRuleBase } from '@qti-components/base';

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
    try {
      for (const rule of rules) {
        rule.process();
      }
    } catch (error) {
      // `qti-exit-test` ends the run from wherever it sits, however deeply
      // nested. Reaching here is the rule doing its job; anything else is a
      // real failure and rethrows.
      if (!(error instanceof QtiExitTestSignal)) throw error;
    }
  }
}
