import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { watch } from '@qti-components/utilities';

// eslint-disable-next-line import/no-relative-packages
import styles from '../../../../qti-interactions/src/components/qti-choice-interaction/qti-choice-interaction.styles';
// eslint-disable-next-line import/no-relative-packages
import { VocabularyMixin } from '../../../../qti-interactions/src/mixins/vocabulary/vocabulary-mixin';

import type { CSSResultGroup } from 'lit';

export type Orientation = 'horizontal' | 'vertical' | undefined;
export class QtiChoiceInteractionEdit extends VocabularyMixin(LitElement, 'qti-simple-choice') {
  static styles: CSSResultGroup = styles;

  @property({ type: Number, attribute: 'max-choices' })
  public maxChoices = 1;

  protected _internals: ElementInternals;
  private _mutationObserver: MutationObserver | null = null;

  @watch('maxChoices', { waitUntilFirstUpdate: true })
  protected _handleMaxChoicesChange() {
    this._updateChoices();
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._updateChoices();
    this._mutationObserver = new MutationObserver(() => this._updateChoices());
    this._mutationObserver.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._mutationObserver?.disconnect();
    this._mutationObserver = null;
  }

  private _updateChoices() {
    this._internals.role = this.maxChoices === 1 ? 'radiogroup' : null;
    const role = this.maxChoices === 1 ? 'radio' : 'checkbox';

    this.querySelectorAll('qti-simple-choice').forEach((choice: any) => {
      if (!choice.internals?.states?.has('radio') && !choice.internals?.states?.has('checkbox')) {
        choice.internals.role = role;
        choice.internals.states.delete(role === 'radio' ? 'checkbox' : 'radio');
        choice.internals.states.add(role);
      }
    });
  }
  // @slotchange=${this._handleSlotChange}
  // private _handleSlotChange() {
  //   // count the number of choices, set a css variable for the number of choices
  //   const choices = this.querySelectorAll('qti-simple-choice');
  //   this.style.setProperty('--item-count', choices.length.toString());
  // }

  override render() {
    return html`
      <slot part="prompt" name="prompt"></slot>
      <slot part="slot"></slot>
    `;
  }
}

customElements.define('qti-choice-interaction', QtiChoiceInteractionEdit);
