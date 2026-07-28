import { html } from 'lit';
import { property } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';
import { ChoicesMixin } from '@qti-components/interactions-core/mixins/choices/choices.mixin';

import styles from './qti-hottext-interaction.styles';

import type { CSSResultGroup, PropertyValues } from 'lit';
/**
 * Hottext interaction: candidates select highlighted words within a text block.
 *
 * @customElement qti-hottext-interaction
 *
 * @attr {string} response-identifier - Required. Identifier of the bound response variable.
 * @attr {number} [max-choices=1] - Maximum selectable hottexts; `0` means unlimited.
 * @attr {number} [min-choices=0] - Minimum selectable hottexts for a valid response.
 * @attr {'qti-unselected-hidden'} class - QTI shared presentation vocabulary.
 *   `qti-unselected-hidden` leaves the selectable words visually indistinguishable from the
 *   surrounding prose until they are selected.
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
