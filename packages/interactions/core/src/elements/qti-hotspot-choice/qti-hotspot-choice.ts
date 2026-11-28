import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';
import styles from './qti-hotspot-choice.styles';

import type { PropertyValues } from 'lit';
import type { CSSResultGroup } from 'lit';

/**
 * A clickable area on the image of `qti-hotspot-interaction` or `qti-graphic-order-interaction`.
 *
 * @customElement qti-hotspot-choice
 * @cssstate checked - Chosen by the candidate.
 * @cssstate disabled - Switched off by the interaction.
 * @cssstate readonly - Frozen by the interaction.
 * @attr {number} data-order - Graphic order: the 1-based position the candidate gave this choice.
 *   A theme prints it with `attr(data-order)`. Reflected from the `order` property; the old
 *   `aria-ordervalue` spelling (not an ARIA attribute) is written too for one major.
 */
export class QtiHotspotChoice extends ActiveElementMixin(LitElement, 'qti-hotspot-choice') {
  static override styles: CSSResultGroup = styles;
  @property({ attribute: 'aria-ordervalue', type: Number, reflect: true }) order: number;

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (changed.has('order')) {
      if (this.order === undefined || this.order === null) this.removeAttribute('data-order');
      else this.setAttribute('data-order', String(this.order));
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hotspot-choice': QtiHotspotChoice;
  }
}
