import { property } from 'lit/decorators.js';
import { LitElement } from 'lit';

export class QtiMapping extends LitElement {
  @property({ attribute: 'default-value', type: Number }) defaultValue: number = 0;
  @property({ attribute: 'lower-bound', type: Number }) lowerBound: number;
  @property({ attribute: 'upper-bound', type: Number }) upperBound: number;

  public get mapEntries() {
    return Array.from(this.querySelectorAll('qti-map-entry')).map(el => {
      const caseSensitive = el.hasAttribute('case-sensitive')
        ? el.getAttribute('case-sensitive') === 'false'
          ? false
          : true
        : true;
      return {
        mapKey: el.getAttribute('map-key'),
        mappedValue: +el.getAttribute('mapped-value'),
        caseSensitive
      };
    });
  }
}

customElements.define('qti-mapping', QtiMapping);
