import { css } from 'lit';
import { property } from 'lit/decorators.js';
import { QtiChoice } from './internal/choice/qti-choice';

// type shape = { shape: 'rect' | 'circle' | 'poly'; coords: number[] };

export class QtiHotspotChoice extends QtiChoice {
  @property({ attribute: 'aria-ordervalue', type: Number, reflect: true }) order: number;

  static override styles = css`
    :host {
      position: absolute;
    }
  `;
}
customElements.define('qti-hotspot-choice', QtiHotspotChoice);
