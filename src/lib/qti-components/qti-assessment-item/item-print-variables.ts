import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ItemContext, itemContext } from './qti-assessment-item.context';

@customElement('item-print-variables')
export class ItemPrintVariables extends LitElement {
  @consume({ context: itemContext, subscribe: true })
  @state()
  public itemContext?: ItemContext;

  render() {
    return html` <pre>${JSON.stringify(this.itemContext, null, 2)}</pre> `;
  }
}
