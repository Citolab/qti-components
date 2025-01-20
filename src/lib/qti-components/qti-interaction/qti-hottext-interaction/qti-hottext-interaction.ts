import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { ChoicesMixin } from '../internal/choices/choices.mixin';
import { Interaction } from '../../../exports/interaction';

@customElement('qti-hottext-interaction')
export class QtiHottextInteraction extends ChoicesMixin(Interaction, 'qti-hottext') {
  override render = () => html`<slot></slot>`;
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hottext-interaction': QtiHottextInteraction;
  }
}
