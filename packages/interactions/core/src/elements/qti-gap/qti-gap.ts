import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import styles from './qti-gap.styles';

import type { CSSResultGroup } from 'lit';

export class QtiGap extends LitElement {
  static override styles: CSSResultGroup = styles;

  /** Carries `:state(filled)` while the gap holds a chip. */
  public internals: ElementInternals = this.attachInternals();

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  override render() {
    return html` <slot part="drop" name="drags"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap': QtiGap;
  }
}
