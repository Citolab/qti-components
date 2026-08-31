import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import styles from './qti-gap-img.styles';

import type { CSSResultGroup } from 'lit';

export class QtiGapImg extends LitElement {
  static override styles: CSSResultGroup = styles;

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  /**
   * `qti-gap-img` is a draggable chip, so it needs ElementInternals to carry the drag states
   * (`dragging`, `placeholder`). It works without a shadow root.
   *
   * NOTE: this element never calls `super.connectedCallback()`, so Lit never enables updating
   * and it has no shadow root — which makes `qti-gap-img.styles.ts` dead code. Fixing that means
   * adding a `<slot>` to a `render()` first, otherwise the authored `<img>` child disappears.
   */
  public internals: ElementInternals = this.attachInternals();

  override connectedCallback() {
    this.setAttribute('slot', 'drags');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-img': QtiGapImg;
  }
}
