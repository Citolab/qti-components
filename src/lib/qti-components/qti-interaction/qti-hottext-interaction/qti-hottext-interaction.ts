import { html } from 'lit';
import { Choices } from '../internal/choices/choices';

export class QtiHottextInteraction extends Choices {
  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('qti-hottext-interaction', '');
  }

  override render = () => html`<slot></slot>`;
}

customElements.define('qti-hottext-interaction', QtiHottextInteraction);
