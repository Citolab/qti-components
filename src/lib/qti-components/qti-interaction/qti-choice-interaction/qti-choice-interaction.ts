import type { CSSResultGroup } from 'lit';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ChoicesInterface, ChoicesMixin } from '../internal/choices/choices.mixin';
import { ShuffleMixin } from '../internal/shuffle/shuffle-mixin';
import { VocabularyMixin } from '../internal/vocabulary/vocabulary-mixin';
import styles from './qti-choice-interaction.styles';
import { Interaction } from '../internal/interaction/interaction';

export type Orientation = 'horizontal' | 'vertical' | undefined;

@customElement('qti-choice-interaction')
export class QtiChoiceInteraction
  extends VocabularyMixin(
    ShuffleMixin(ChoicesMixin(Interaction, 'qti-simple-choice'), 'qti-simple-choice'),
    'qti-simple-choice'
  )
  implements ChoicesInterface
{
  static styles: CSSResultGroup = styles;

  constructor() {
    super();
    this._internals.role = 'group';
  }

  /**
   * The orientation characteristic provides a hint to rendering systems that the choices have an inherent vertical or horizontal interpretation.
   * [5.30.4](https://www.imsglobal.org/sites/default/files/spec/qti/v3/info/index.html#DataCharacteristic_ChoiceInteraction.Attr_orientation)
   */
  @property({ type: String })
  public orientation: Orientation;

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
