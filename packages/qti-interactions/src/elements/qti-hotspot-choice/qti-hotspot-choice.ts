import { css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';

// type shape = { shape: 'rect' | 'circle' | 'poly'; coords: number[] };
export class QtiHotspotChoice extends ActiveElementMixin(LitElement, 'qti-hotspot-choice') {
  static override styles = css`
    :host {
      display: flex;
      user-select: none;
      position: absolute;
    }
  `;
  @property({ attribute: 'aria-ordervalue', type: Number, reflect: true }) order: number;
  @property({ attribute: 'aria-ordercorrectvalue', type: Number, reflect: true }) orderCorrect: number;
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hotspot-choice': QtiHotspotChoice;
  }
}
