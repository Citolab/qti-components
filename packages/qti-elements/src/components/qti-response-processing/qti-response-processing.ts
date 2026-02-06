import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { type QtiRuleBase } from '@qti-components/base';

import { mapResponse, mapResponsePoint, matchCorrect } from '../../internal/template-strings';

import type { PropertyValueMap } from 'lit';

@customElement('qti-response-processing')
export class QtiResponseProcessing extends LitElement {
  static override styles = [
    css`
      :host {
        display: none;
      }
    `
  ];

  override render() {
    return html`<slot></slot>`;
  }

  public process() {
    const assessmentItem = this.closest('qti-assessment-item');
    if (!assessmentItem) return;
    const rules = [...this.children] as unknown as QtiRuleBase[];
    for (const rule of rules) {
      rule.process();
    }
  }

  public override firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (this.getAttribute('template')) {
      const splittedTemplateName = this.getAttribute('template')!.split('/');
      const templateName = splittedTemplateName[splittedTemplateName.length - 1].replace('.xml', '');
      this.innerHTML = '';
      switch (templateName) {
        case 'map_response': {
          this.appendChild(this.#fragmentFromString(mapResponse).firstElementChild.firstElementChild);
          break;
        }
        case 'map_response_point': {
          this.appendChild(this.#fragmentFromString(mapResponsePoint).firstElementChild.firstElementChild);
          break;
        }
        case 'match_correct':
          this.appendChild(this.#fragmentFromString(matchCorrect).firstElementChild.firstElementChild);
          break;
      }
    }
  }

  #fragmentFromString(strHTML: string) {
    return document.createRange().createContextualFragment(strHTML);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-response-processing': QtiResponseProcessing;
  }
}
