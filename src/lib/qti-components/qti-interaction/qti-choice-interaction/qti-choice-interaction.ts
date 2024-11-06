import type { CSSResultGroup } from 'lit';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ChoicesInterface, ChoicesMixin } from '../internal/choices/choices.mixin';
import { ShuffleMixin } from '../internal/shuffle/shuffle-mixin';
import { VocabularyMixin } from '../internal/vocabulary/vocabulary-mixin';
import styles from './qti-choice-interaction.styles';
import { Interaction } from '../internal/interaction/interaction';

@customElement('qti-choice-interaction')
export class QtiChoiceInteraction
  extends VocabularyMixin(
    ShuffleMixin(ChoicesMixin(Interaction, 'qti-simple-choice'), 'qti-simple-choice'),
    'qti-simple-choice'
  )
  implements ChoicesInterface
{
  static styles: CSSResultGroup = styles;

  /** orientation of choices */
  @property({ type: String })
  public orientation: 'horizontal' | 'vertical';

  render() {
    return html`
      <slot name="prompt"></slot><slot part="slot"></slot>
      <div role="alert" id="validationMessage"></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-choice-interaction': QtiChoiceInteraction;
  }
}
