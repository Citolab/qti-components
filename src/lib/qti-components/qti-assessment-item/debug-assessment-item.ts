import { html, LitElement } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { consume, ContextConsumer } from '@lit-labs/context';
import { ItemContext, itemContext } from './qti-assessment-item.context';

@customElement('debug-assessment-item')
export class DebugAssessmentItem extends LitElement {
  // @consume({ context: itemContext, subscribe: true })
  // @state()
  // private _context: Item;
  // connectedCallback(): void {
  //   super.connectedCallback();
  //   // new ContextConsumer(
  //   //   this,
  //   //   itemContext,
  //   //   e => this.dispatchEvent(new CustomEvent('context-changed', { bubbles: true, composed: true, detail: e })),
  //   //   true
  //   // );
  // }
  // render() {
  //   return html` <pre>${JSON.stringify(this._context.variables, null, 2)}</pre> `;
  // }
}
