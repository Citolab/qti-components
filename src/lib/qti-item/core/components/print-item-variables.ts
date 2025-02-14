import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { computedItemContext } from '../../../exports/computed-item.context';

import type { ResponseVariable } from '../../../exports/variables';
import type { ComputedItemContext } from '../../../exports/computed-item.context';

@customElement('print-item-variables')
export class PrintItemVariables extends LitElement {
  @consume({ context: computedItemContext, subscribe: true })
  public computedContext?: ComputedItemContext;

  @property({ type: String, reflect: true })
  public mode: 'summed' | 'complete' = 'summed';

  private _previousActiveItem?: ComputedItemContext & { correctResponse: string; response: string } = null; // Store previous active item reference
  render() {
    console.log('computedContext', this.computedContext);
    if (this.computedContext) {
      const responseVariables: ResponseVariable[] = this.computedContext.variables?.filter(v => {
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
      const printableItemContext = {
        ...this.computedContext,
        response,
        correctResponse:
          this._previousActiveItem?.identifier === this.computedContext.identifier &&
          this._previousActiveItem?.correctResponse
            ? this._previousActiveItem.correctResponse
            : correctResponse
      };
      if (this.mode === 'summed') {
        delete printableItemContext.variables;
      }
      this._previousActiveItem = printableItemContext;
      return html` <small><pre>${JSON.stringify(printableItemContext, null, 2)}</pre></small> `;
    }
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'print-item-variables': PrintItemVariables;
  }
}
