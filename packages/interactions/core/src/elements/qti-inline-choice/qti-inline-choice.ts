import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin.js';
import styles from './qti-inline-choice.styles.js';

import type { CSSResultGroup } from 'lit';
import type { PropertyValues } from 'lit';
/**
 * An option in the dropdown of `qti-inline-choice-interaction`.
 *
 * @customElement qti-inline-choice
 *
 * @attr {string} identifier - Required. Value recorded in the response when this option is
 *   selected.
 * @attr {boolean} [fixed=false] - Pins this option in place when the interaction is shuffled.
 * @attr {string} template-identifier - Not implemented. Identifier of a template variable
 *   controlling this option's visibility.
 * @attr {'show'|'hide'} [show-hide=show] - Not implemented. How `template-identifier` controls
 *   visibility.
 */
export class QtiInlineChoice extends ActiveElementMixin(LitElement, 'qti-inline-choice') {
  static override styles: CSSResultGroup = styles;

  @property({ type: String })
  identifier: string;

  override connectedCallback() {
    super.connectedCallback();

    this.addEventListener('click', this.#onSelectInlineChoice);

    this.dispatchEvent(
      new CustomEvent('qti-inline-choice-register', {
        bubbles: true,
        composed: true,
        cancelable: false
      })
    );
  }

  override disconnectedCallback() {
    this.removeEventListener('click', this.#onSelectInlineChoice);
  }

  override render() {
    return html` <slot></slot> `;
  }

  #onSelectInlineChoice() {
    // if (this.disabled || this.readonly) return;

    this.dispatchEvent(
      new CustomEvent('qti-inline-choice-select', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: { identifier: this.identifier }
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-inline-choice': QtiInlineChoice;
  }
}
