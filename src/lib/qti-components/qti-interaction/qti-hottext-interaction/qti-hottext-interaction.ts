import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ChoicesMixin } from '../internal/choices/choices';

@customElement('qti-hottext-interaction')
export class QtiHottextInteraction extends ChoicesMixin(LitElement, 'qti-hottext') {
  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('qti-hottext-interaction', '');
  }

  override render = () => html`<slot></slot>`;
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hottext-interaction': QtiHottextInteraction;
  }
}
