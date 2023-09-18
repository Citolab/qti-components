import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import styles from './qti-choice-interaction.styles';
import type { CSSResultGroup } from 'lit';
import { Choices } from '../internal/choices/choices';

/**
 * @summary The ChoiceInteraction.Type (qti-choice-interaction) interaction presents a collection of choices to the candidate.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.j9nu1oa1tu3b
 * @status stable
 * @since 6.0
 *
 * @event qti-register-interaction - emitted when the interaction wants to register itself
 * @event qti-interaction-response - emitted when the interaction changes
 *
 * @slot - The default slot where <qti-simple-choice> must be placed.
 * @slot prompt - slot where the prompt is placed.
 */

@customElement('qti-choice-interaction')
export class QtiChoiceInteraction extends Choices {
  static styles: CSSResultGroup = styles;

  /** orientation of choices */
  @property({ type: String })
  public orientation: 'horizontal' | 'vertical';

  render() {
    return html` <slot name="prompt"></slot><slot part="slot"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-choice-interaction': QtiChoiceInteraction;
  }
}
