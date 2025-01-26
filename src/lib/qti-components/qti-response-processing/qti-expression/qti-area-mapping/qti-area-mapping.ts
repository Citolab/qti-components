import { property } from 'lit/decorators.js';
import { LitElement } from 'lit';

export class QtiAreaMapping extends LitElement {
  @property({ attribute: 'default-value', type: Number }) defaultValue: number = 0;
  @property({ attribute: 'lower-bound', type: Number }) lowerBound: number;
  @property({ attribute: 'upper-bound', type: Number }) upperBound: number;

  public get mapEntries() {
    return Array.from(this.querySelectorAll('qti-area-map-entry')).map(el => {
      return {
        shape: el.getAttribute('shape'),
        coords: el.getAttribute('coords'),
        mappedValue: +el.getAttribute('mapped-value'),
        defaultValue: el.getAttribute('default-value') ? +el.getAttribute('default-value') : 0
      } as {
        shape: 'default' | 'circle' | 'rect' | 'ellipse' | 'poly';
        coords: string;
        mappedValue: number;
        defaultValue: number;
      };
    });
  }
}

customElements.define('qti-area-mapping', QtiAreaMapping);
