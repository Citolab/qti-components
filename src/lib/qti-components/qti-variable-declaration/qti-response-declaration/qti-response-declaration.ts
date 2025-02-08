import { consume } from '@lit/context';
import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { itemContext } from '../../../exports/qti-assessment-item.context';
import { QtiVariableDeclaration } from '../qti-variable-declaration';

import type { QtiAreaMapping } from '../../qti-response-processing';
import type { BaseType, Cardinality } from '../../../exports/expression-result';
import type { ResponseVariable } from '../../../exports/variables';
import type { QtiMapping } from '../../qti-response-processing/qti-expression/qti-mapping/qti-mapping';
import type { ItemContext } from '../../../exports/item.context';

@customElement('qti-response-declaration')
export class QtiResponseDeclaration extends QtiVariableDeclaration {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType;

  @property({ type: String }) identifier: string;

  @property({ type: String }) cardinality: Cardinality;

  @consume({ context: itemContext, subscribe: true })
  @state()
  public itemContext?: ItemContext;

  static styles = [
    css`
      :host {
        display: none;
      }
    `
  ];

  override render() {
    const value = this.itemContext?.variables.find(v => v.identifier === this.identifier)?.value;
    return html`${JSON.stringify(value, null, 2)}`;
  }

  public override connectedCallback() {
    super.connectedCallback();

    const responseVariable: ResponseVariable = {
      baseType: this.baseType,
      identifier: this.identifier,
      correctResponse: this.correctResponse,
      cardinality: this.cardinality || 'single',
      mapping: this.mapping,
      areaMapping: this.areaMapping,
      value: null,
      type: 'response',
      candidateResponse: null
    };
    responseVariable.value = this.defaultValues(responseVariable);

    this.dispatchEvent(
      new CustomEvent('qti-register-variable', {
        bubbles: true,
        composed: true,
        detail: { variable: responseVariable }
      })
    );
  }

  private get correctResponse(): string | string[] {
    let result: string | string[];
    const correctResponse = this.querySelector('qti-correct-response');
    if (correctResponse) {
      const values = correctResponse.querySelectorAll('qti-value');
      if (this.cardinality === 'single' && values.length > 0) {
        result = values[0].textContent.trim();
        values[0].remove();
      } else if (this.cardinality !== 'single') {
        result = [];
        for (let i = 0; i < values.length; i++) {
          result.push(values[i].textContent.trim());
          values[i].remove();
        }
      }
    }
    return result;
  }

  private get mapping(): QtiMapping {
    const mappingElement = this.querySelector('qti-mapping');
    return {
      defaultValue: Number(mappingElement?.getAttribute('default-value')) || 0,
      lowerBound: Number(mappingElement?.getAttribute('lower-bound')) || 0,
      upperBound: Number(mappingElement?.getAttribute('upper-bound')) || 0,
      mapEntries: Array.from(mappingElement?.querySelectorAll('qti-map-entry') || []).map(el => ({
        mapKey: el.getAttribute('map-key') || '',
        mappedValue: Number(el.getAttribute('mapped-value')) || 0,
        caseSensitive: el.hasAttribute('case-sensitive') ? el.getAttribute('case-sensitive') !== 'false' : true
      }))
    };
  }

  private get areaMapping(): QtiAreaMapping {
    const areaMappingElement = this.querySelector('qti-area-mapping') as HTMLElement;

    const defaultValue = Number(areaMappingElement?.getAttribute('default-value')) || 0;
    const lowerBound = Number(areaMappingElement?.getAttribute('lower-bound')) || 0;
    const upperBound = Number(areaMappingElement?.getAttribute('upper-bound')) || 0;

    const areaMapEntries = Array.from(areaMappingElement?.querySelectorAll('qti-area-map-entry') || []).map(
      (el: HTMLElement) => ({
        shape: (el.getAttribute('shape') as 'default' | 'circle' | 'rect' | 'ellipse' | 'poly') || 'default',
        coords: el.getAttribute('coords') || '',
        mappedValue: Number(el.getAttribute('mapped-value')) || 0,
        defaultValue: Number(el.getAttribute('default-value')) || 0
      })
    );

    return {
      defaultValue,
      lowerBound,
      upperBound,
      areaMapEntries
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-response-declaration': QtiResponseDeclaration;
  }
}
