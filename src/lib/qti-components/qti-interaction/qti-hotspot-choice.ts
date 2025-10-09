import { css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { ActiveElementMixin } from './internal/active-element/active-element.mixin';

// type shape = { shape: 'rect' | 'circle' | 'poly'; coords: number[] };

@customElement('qti-hotspot-choice')
export class QtiHotspotChoice extends ActiveElementMixin(LitElement, 'qti-hotspot-choice') {
  static styles = css`
    :host {
      display: flex;
      user-select: none;
      position: absolute;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
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
