import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { watch } from '@qti-components/utilities';
import { VocabularyMixin } from '@qti-components/interactions/src/mixins/vocabulary/vocabulary-mixin';
import styles from '@qti-components/interactions/src/components/qti-choice-interaction/qti-choice-interaction.styles';

import type { CSSResultGroup } from 'lit';

export type Orientation = 'horizontal' | 'vertical' | undefined;
export class QtiChoiceInteractionEdit extends VocabularyMixin(LitElement, 'qti-simple-choice') {
  static styles: CSSResultGroup = styles;

  @property({ type: Number, attribute: 'min-choices' })
  public minChoices = 0;

  @property({ type: Number, attribute: 'max-choices' })
  public maxChoices = 1;

  @property({ type: String, attribute: 'class' })
  public classes: 'qti-orientation-vertical' | 'qti-orientation-horizontal' | undefined;

  @watch('maxChoices', { waitUntilFirstUpdate: true })
  protected _handleMaxChoicesChange() {
    this.#updateChoices();
  }

  protected _internals: ElementInternals;
  #mutationObserver: MutationObserver | null = null;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#updateChoices();
    this.#mutationObserver = new MutationObserver(() => this.#updateChoices());
    this.#mutationObserver.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = null;
  }

  #updateChoices() {
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
    return html`<slot part="prompt" name="prompt"></slot><slot part="slot"></slot>`;
  }
}

customElements.define('qti-choice-interaction', QtiChoiceInteractionEdit);
