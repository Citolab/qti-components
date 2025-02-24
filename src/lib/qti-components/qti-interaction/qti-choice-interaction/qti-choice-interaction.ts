import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { ChoicesMixin } from '../internal/choices/choices.mixin';
import { VocabularyMixin } from '../internal/vocabulary/vocabulary-mixin';
import styles from './qti-choice-interaction.styles';
import { Interaction } from '../../../exports/interaction';

import type { ChoicesInterface } from '../internal/choices/choices.mixin';
import type { CSSResultGroup } from 'lit';

export type Orientation = 'horizontal' | 'vertical' | undefined;

/**
 * An sample element.
 *
 * @slot - default slot of the choices
 * @slot prompt - slot of the prompt
 *
 * @csspart slot - The choice elements
 * @csspart prompt - The prompt
 * @csspart message - The validation message
 *
 * @cssprop [--qti-bg-active=#ffecec] - The active background color
 * @cssprop [--qti-border-active=#f86d70] - The active border color
 * @cssprop [--qti-padding-horizontal=1px] - The option horizontal padding
 * @cssprop [--qti-padding-vertical=solid] - The option vertical padding
 * @cssprop [--qti-border-radius=8px] - The option border radius
 */
@customElement('qti-choice-interaction')
export class QtiChoiceInteraction
  extends VocabularyMixin(ChoicesMixin(Interaction, 'qti-simple-choice'), 'qti-simple-choice')
  implements ChoicesInterface
{
  static styles: CSSResultGroup = styles;

  constructor() {
    super();
    this._internals.role = 'group';
  }

  /** @deprecated, use 'qti-orientation-horizontal' or 'qti-orientation-vertical' instead */
  @property({ type: String })
  public orientation: Orientation;

  handleSlotChange() {
    // count the number of choices, set a css variable for the number of choices
    const choices = this.querySelectorAll('qti-simple-choice');
    this.style.setProperty('--item-count', choices.length.toString());
  }

  render() {
    return html`
      <slot part="prompt" name="prompt"></slot><slot part="slot" @slotchange=${this.handleSlotChange}></slot>
      <div part="message" role="alert" id="validationMessage"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-choice-interaction': QtiChoiceInteraction;
  }
}
