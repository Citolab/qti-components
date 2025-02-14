import { html, LitElement } from 'lit';
import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';

import { computedContext } from '../../exports/computed.context';

import type { ResponseVariable } from '../../exports/variables';
import type { ComputedContext, ComputedItem } from '../../exports/computed.context';

@customElement('test-print-item-variables')
export class TestPrintVariables extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  public computedContext?: ComputedContext;

  @property({ type: String, reflect: true })
  public mode: 'summed' | 'complete' = 'summed';

  private _previousActiveItem?: ComputedItem & { correctResponse: string; response: string }; // Store previous active item reference

  render() {
    const activeItems = this.computedContext?.testParts.flatMap(testPart =>
      testPart.sections.flatMap(section => section.items).find(item => item.active)
    );
    const activeItem = activeItems.length > 0 ? activeItems[0] : null;
    if (activeItem) {
      const responseVariables: ResponseVariable[] = activeItem.variables?.filter(v => {
        if (v.type !== 'response') {
          return false;
        }
        if (v.identifier.toLowerCase().startsWith('response')) {
          return true;
        }
        if ((v as ResponseVariable).correctResponse) {
          return true;
        }
      });
      // sort the response variables by the order of the string: identifier
      const sortedResponseVariables = responseVariables?.sort((a, b) => a.identifier.localeCompare(b.identifier));
      const correctResponseArray = sortedResponseVariables.map(r => {
        if (r.mapping && r.mapping.mapEntries.length > 0) {
          return r.mapping.mapEntries
            .map(m => {
              return `${m.mapKey}=${m.mappedValue}pt `;
            })
            .join('&');
        }
        if (r.areaMapping && r.areaMapping.areaMapEntries.length > 0) {
          return r.areaMapping.areaMapEntries.map(m => {
            return `${m.coords} ${m.shape}=${m.mappedValue}`;
          });
        }
        if (r.correctResponse) {
          return Array.isArray(r.correctResponse) ? r.correctResponse.join('&') : r.correctResponse;
        }
        return [];
      });
      const correctResponse = correctResponseArray.join('&');
      const response =
        sortedResponseVariables.length === 0
          ? ''
          : sortedResponseVariables
              ?.map(v => {
                if (Array.isArray(v.value)) {
                  return v.value.join('&');
                }
                return v.value;
              })
              .join('#');
      const itemToReturn = {
        ...activeItem,
        response,
        correctResponse:
          this._previousActiveItem?.identifier === activeItem.identifier && this._previousActiveItem?.correctResponse
            ? this._previousActiveItem.correctResponse
            : correctResponse
      };
      if (this.mode === 'summed') {
        delete itemToReturn.variables;
      }
      this._previousActiveItem = itemToReturn;
      return html` <small><pre>${JSON.stringify(itemToReturn, null, 2)}</pre></small> `;
    }
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-print-item-variables': TestPrintVariables;
  }
}
