import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import styles from './qti-gap-img.styles';

import type { CSSResultGroup } from 'lit';

export class QtiGapImg extends LitElement {
  static override styles: CSSResultGroup = styles;

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  override connectedCallback() {
    this.setAttribute('slot', 'drags');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-img': QtiGapImg;
  }
}
