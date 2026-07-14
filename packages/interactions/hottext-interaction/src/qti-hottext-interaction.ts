import { html } from 'lit';
import { property } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';
import { ChoicesMixin } from '@qti-components/interactions-core/mixins/choices/choices.mixin';

import styles from './qti-hottext-interaction.styles';

import type { CSSResultGroup, PropertyValues } from 'lit';
/**
 * Hottext interaction: candidates select highlighted words within a text block.
 *
 * @slot - Default slot for the mixed content and `qti-hottext` choices.
 *
 * @csspart message - Live validation message region (role="alert").
 */
export class QtiHottextInteraction extends ChoicesMixin(Interaction, 'qti-hottext') {
  static override styles: CSSResultGroup = styles;

  override render = () =>
    html`<slot></slot>
      <div part="message" role="alert" id="validation-message"></div>`;
}
