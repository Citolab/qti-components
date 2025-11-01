import { customElement } from 'lit/decorators.js';
import { html, LitElement } from 'lit';

@customElement('qti-rule')
export class QtiRule extends LitElement implements QtiRuleBase {
  override render() {
    return html`<slot></slot>`;
  }

  public process() {
    throw new Error('Not implemented');
  }
}

export interface QtiRuleBase {
  process(): any;
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-rule': QtiRule;
  }
}
