import { ContextConsumer } from '@lit-labs/context';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { testContext } from '../qti-assessment-test.context';

@customElement('test-script')
export class TestScript extends LitElement {
  private operatorFunction: Function;
  private _context: ContextConsumer<any, this>;

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  handleSlotChange(event: Event) {
    // expecting <[!CDATA[ ... ]]> is converted into <!-- ... --> with qti-transform: cDataToComment
    const commentNode = Array.from(this.childNodes ?? []).find(node => node.nodeType === Node.COMMENT_NODE);
    try {
      this.operatorFunction = new Function('context', commentNode.textContent ?? '');
    } catch (e) {
      console.error('custom-operator contains invalid javascript code', e);
    }
    this._context = new ContextConsumer(this, testContext, e => this.operatorFunction(e), true);
  }
}
