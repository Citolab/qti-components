import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';
import styles from './qti-gap-text.styles';

import type { CSSResultGroup } from 'lit';

export class QtiGapText extends ActiveElementMixin(LitElement, 'qti-gap-text') {
  static override styles: CSSResultGroup = styles;

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('slot', 'drags');
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-text': QtiGapText;
  }
}
