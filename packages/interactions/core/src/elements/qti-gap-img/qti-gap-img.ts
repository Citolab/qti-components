import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import styles from './qti-gap-img.styles';

import type { CSSResultGroup } from 'lit';

export class QtiGapImg extends LitElement {
  static override styles: CSSResultGroup = styles;

  @property({ type: Number, reflect: true }) tabindex: number | undefined = 0;

  /**
   * `qti-gap-img` is a draggable chip, so it needs ElementInternals to carry the drag states
   * (`dragging`, `placeholder`).
   */
  public internals: ElementInternals = this.attachInternals();

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('slot', 'drags');
  }

  /*
   * The slot is what makes qti-gap-img.styles.ts live.
   *
   * This used to skip `super.connectedCallback()`, so Lit never enabled updating, the element had
   * no shadow root, and its own `:host { display: flex; align-items: center }` was dead code. The
   * authored `<img>`/`<object>` was then laid out as an inline replaced element on a text baseline
   * instead of being centred — it sat low in the chip with the line box's descender space below it,
   * which is what pushed a placed chip out of the bottom of its hotspot.
   *
   * Shaped like qti-gap-text, the sibling chip that always did this correctly, so `exportparts`'
   * `label` resolves for both.
   */
  override render() {
    return html`<slot part="label"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-gap-img': QtiGapImg;
  }
}
