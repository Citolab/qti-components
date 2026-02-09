import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { ActiveElementMixin } from '@qti-components/interactions/mixins/active-element/active-element.mixin.js';

import styles from './qti-inline-choice.styles.js';

import type { CSSResultGroup } from 'lit';
import type { PropertyValues } from 'lit';
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
