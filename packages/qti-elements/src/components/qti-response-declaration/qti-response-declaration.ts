import { consume } from '@lit/context';
import { css, html } from 'lit';
import { property, state } from 'lit/decorators.js';

import { itemContext } from '@qti-components/base';
import { QtiVariableDeclaration, readRecordFieldValues } from '@qti-components/base';

import type { QtiAreaMapping } from '@qti-components/base';
import type { BaseType, Cardinality } from '@qti-components/base';
import type { RecordValue, ResponseVariable } from '@qti-components/base';
import type { QtiMapping } from '@qti-components/base';
import type { ItemContext } from '@qti-components/base';

export class QtiResponseDeclaration extends QtiVariableDeclaration {
  @property({ type: String, attribute: 'base-type' }) baseType: BaseType;

  @property({ type: String }) identifier: string;

  @property({ type: String }) cardinality: Cardinality;

  @consume({ context: itemContext, subscribe: true })
  @state()
  public itemContext?: ItemContext;

  static override styles = [
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
    // A record value is its field map; the variable types only spell out string | string[].
    const defaultValue =
      this.cardinality === 'record'
        ? (this.#recordDefaultValue as unknown as string | string[] | null)
        : this.defaultValues(this.cardinality);
    const { correctResponse, fieldBaseTypes } = this.#readCorrectResponse();

    const responseVariable: ResponseVariable = {
      baseType: this.baseType,
      identifier: this.identifier,
      correctResponse,
      ...(fieldBaseTypes ? { fieldBaseTypes } : {}),
      cardinality: this.cardinality || 'single',
      mapping: this.#mapping,
      defaultValue,
      areaMapping: this.#areaMapping,
      value: null,
      type: 'response',
      candidateResponse: null
    };
    responseVariable.value = defaultValue;

    this.dispatchEvent(
      new CustomEvent('qti-register-variable', {
        bubbles: true,
        composed: true,
        detail: { variable: responseVariable }
      })
    );
  }

  /**
   * The correct response, and for `record` cardinality the declared base type of each field.
   *
   * A record's correct response is a field map, `{ time: '4.0', point: '460 245' }`, read from
   * `qti-value field-identifier="…" base-type="…"`. The field base types are kept beside it, since
   * the record declaration itself has no `base-type` to say how a field is to be compared.
   */
  #readCorrectResponse(): { correctResponse: string | string[]; fieldBaseTypes?: ResponseVariable['fieldBaseTypes'] } {
    if (this.cardinality !== 'record') {
      return { correctResponse: this.#correctResponse };
    }
    const correctResponse = this.querySelector('qti-correct-response');
    if (!correctResponse) {
      return { correctResponse: undefined };
    }
    const values = Array.from(correctResponse.querySelectorAll('qti-value'));
    const { value, baseTypes } = readRecordFieldValues(values);
    values.forEach(element => element.remove());
    return {
      // The variable types hold string | string[]; a record is stored as its field map.
      correctResponse: (Object.keys(value).length ? value : undefined) as unknown as string | string[],
      fieldBaseTypes: baseTypes
    };
  }

  /** A record's `qti-default-value`, as a field map like its correct response. */
  get #recordDefaultValue(): RecordValue | null {
    const values = this.querySelectorAll('qti-default-value > qti-value');
    if (values.length === 0) return null;
    const { value } = readRecordFieldValues(values);
    return Object.keys(value).length ? value : null;
  }

  get #correctResponse(): string | string[] {
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

  get #mapping(): QtiMapping {
    const mappingElement = this.querySelector('qti-mapping');
    const lowerBound = parseFloat(mappingElement?.getAttribute('lower-bound'));
    const uppperBound = parseFloat(mappingElement?.getAttribute('upper-bound'));
    const mappingValue = {
      defaultValue: Number(mappingElement?.getAttribute('default-value')) || 0,
      lowerBound: isNaN(lowerBound) ? null : lowerBound,
      upperBound: isNaN(uppperBound) ? null : uppperBound,
      mapEntries: Array.from(mappingElement?.querySelectorAll('qti-map-entry') || []).map(el => ({
        mapKey: el.getAttribute('map-key') || '',
        mappedValue: Number(el.getAttribute('mapped-value')) || 0,
        caseSensitive: el.hasAttribute('case-sensitive') ? el.getAttribute('case-sensitive') !== 'false' : false
      }))
    };
    return mappingValue;
  }

  get #areaMapping(): QtiAreaMapping {
    const areaMappingElement = this.querySelector('qti-area-mapping') as HTMLElement;

    const defaultValue = Number(areaMappingElement?.getAttribute('default-value')) || 0;
    const lowerBound = parseFloat(areaMappingElement?.getAttribute('lower-bound'));
    const uppperBound = parseFloat(areaMappingElement?.getAttribute('upper-bound'));

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
      lowerBound: isNaN(lowerBound) ? null : lowerBound,
      upperBound: isNaN(uppperBound) ? null : uppperBound,
      areaMapEntries
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-response-declaration': QtiResponseDeclaration;
  }
}
