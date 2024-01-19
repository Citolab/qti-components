import { css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QtiChoice } from './internal/choice/qti-choice';

// type shape = { shape: 'rect' | 'circle' | 'poly'; coords: number[] };

@customElement('qti-hotspot-choice')
export class QtiHotspotChoice extends QtiChoice {
  @property({ attribute: 'aria-ordervalue', type: Number, reflect: true }) order: number;

  static override styles = css`
    :host {
      position: absolute;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hotspot-choice': QtiHotspotChoice;
  }
}
