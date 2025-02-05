import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { computedItemContext } from '../../../exports/computed-item.context';

import type { ComputedItemContext } from '../../../exports/computed-item.context';

@customElement('print-item-variables')
export class PrintItemVariables extends LitElement {
  @consume({ context: computedItemContext, subscribe: true })
  public computedContext?: ComputedItemContext;

  render() {
    return html` <small><pre>${JSON.stringify(this.computedContext, null, 2)}</pre></small> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'print-item-variables': PrintItemVariables;
  }
}
