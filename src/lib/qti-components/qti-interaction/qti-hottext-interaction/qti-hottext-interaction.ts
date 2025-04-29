import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { ChoicesMixin } from '../internal/choices/choices.mixin';
import { Interaction } from '../../../exports/interaction';

@customElement('qti-hottext-interaction')
export class QtiHottextInteraction extends ChoicesMixin(Interaction, 'qti-hottext') {
  override render = () =>
    html` <slot></slot>
      <div part="message" role="alert" id="validation-message"></div>`;
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hottext-interaction': QtiHottextInteraction;
  }
}
