import { css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QtiChoice } from './internal/choice/qti-choice';

// type shape = { shape: 'rect' | 'circle' | 'poly'; coords: number[] };

@customElement('qti-hotspot-choice')
export class QtiHotspotChoice extends QtiChoice {
  static styles = css`
    :host {
      display: flex;
      user-select: none;
      position: absolute;
    }
  `;
  @property({ attribute: 'aria-ordervalue', type: Number, reflect: true }) order: number;
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hotspot-choice': QtiHotspotChoice;
  }
}
