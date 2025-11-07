import { customElement } from 'lit/decorators.js';
import { html, LitElement } from 'lit';

import type { QtiRuleBase } from '@qti-components/shared';

@customElement('qti-rule')
export class QtiRule extends LitElement implements QtiRuleBase {
  override render() {
    return html`<slot></slot>`;
  }

  public process() {
    throw new Error('Not implemented');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-rule': QtiRule;
  }
}
