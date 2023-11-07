import { customElement } from 'lit/decorators.js';
import { html, LitElement } from 'lit';

import { mapResponse, mapResponsePoint, matchCorrect } from '../../internal/template-strings';
import { type QtiRule } from '../qti-rule/qti-rule';

@customElement('qti-response-processing')
export default class QtiResponseProcessing extends LitElement {
  override render() {
    return html`<slot></slot>`;
  }
  // fIXME: PK: attributes
  static override get observedAttributes() {
    return ['identifier'];
  }

  public process() {
    if (this.getAttribute('template')) {
      const splittedTemplateName = this.getAttribute('template')!.split('/');
      const templateName = splittedTemplateName[splittedTemplateName.length - 1].replace('.xml', '');
      this.innerHTML = '';
      switch (templateName) {
        case 'map_response': {
          this.appendChild(this.fragmentFromString(mapResponse));
          break;
        }
        case 'map_response_point': {
          this.appendChild(this.fragmentFromString(mapResponsePoint));
          break;
        }
        case 'match_correct':
          this.appendChild(this.fragmentFromString(matchCorrect));
          break;
      }
    }
    const rules = [...this.children] as QtiRule[];

    for (const rule of rules) {
      rule.process();
    }
  }

  private fragmentFromString(strHTML: string) {
    return document.createRange().createContextualFragment(strHTML);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-response-processed': QtiResponseProcessing;
  }
}
