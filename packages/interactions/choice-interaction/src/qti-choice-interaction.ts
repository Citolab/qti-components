import { html } from 'lit';
import { property } from 'lit/decorators.js';

import { Interaction } from '@qti-components/base';
import { ChoicesMixin } from '@qti-components/interactions-core/mixins/choices/choices.mixin';
import { VocabularyMixin } from '@qti-components/interactions-core/mixins/vocabulary/vocabulary-mixin';

import styles from './qti-choice-interaction.styles';

import type { ChoicesInterface } from '@qti-components/interactions-core/mixins/choices/choices.mixin';
import type { CSSResultGroup } from 'lit';

export type Orientation = 'horizontal' | 'vertical' | undefined;

/**
 * A single-response or multiple-response choice interaction.
 *
 * @customElement qti-choice-interaction
 *
 * @attr {string} response-identifier - Required. Identifier of the bound response variable.
 * @attr {number} [max-choices=1] - Maximum selectable choices. `1` is a single-response
 *   item; `0` means unlimited and makes it a multiple-response item.
 * @attr {number} [min-choices=0] - Minimum selectable choices for a valid response.
 * @attr {'horizontal'|'vertical'} [orientation=vertical] - Deprecated by QTI in favour of
 *   the `qti-orientation-*` class vocabulary.
 * @attr {boolean} [shuffle=false] - Requests choice shuffling. Applied by the transform
 *   pipeline (`qti-transformers`), not by this element.
 * @attr {'qti-orientation-horizontal'|'qti-orientation-vertical'|'qti-choices-stacking-1'|'qti-choices-stacking-2'|'qti-choices-stacking-3'|'qti-choices-stacking-4'|'qti-choices-stacking-5'|'qti-choices-stacking-6'|'qti-labels-none'|'qti-labels-decimal'|'qti-labels-lower-alpha'|'qti-labels-upper-alpha'|'qti-labels-suffix-none'|'qti-labels-suffix-period'|'qti-labels-suffix-parenthesis'|'qti-input-control-hidden'} class - QTI shared presentation vocabulary. Space-separated; takes precedence over `orientation`.
 *
 * @slot prompt - The prompt shown above the choices.
 * @slot - Default slot for `qti-simple-choice` elements.
 *
 * @csspart prompt - Wrapper around the prompt slot.
 * @csspart slot - Wrapper around the default slot containing the choices.
 * @csspart message - Live validation message region (role="alert").
 */
export class QtiChoiceInteraction
  extends VocabularyMixin(ChoicesMixin(Interaction, 'qti-simple-choice'), 'qti-simple-choice')
  implements ChoicesInterface
{
  static override styles: CSSResultGroup = styles;

  /** @deprecated, use 'qti-orientation-horizontal' or 'qti-orientation-vertical' instead */
  @property({ type: String })
  public orientation: Orientation = 'vertical';

  #handleSlotChange() {
    // count the number of choices, set a css variable for the number of choices
    const choices = this.querySelectorAll('qti-simple-choice');
    this.style.setProperty('--item-count', choices.length.toString());
  }

  override render() {
    return html`
      <slot part="prompt" name="prompt"></slot>
      <slot part="slot" @slotchange=${this.#handleSlotChange}></slot>
      <div part="message" role="alert" id="validation-message"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-choice-interaction': QtiChoiceInteraction;
  }
}
