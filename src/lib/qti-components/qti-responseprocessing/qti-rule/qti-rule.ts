import { customElement } from 'lit/decorators.js';
import { html, LitElement } from 'lit';

@customElement('qti-rule')
export class QtiRule extends LitElement {
  override render() {
    return html``;
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
