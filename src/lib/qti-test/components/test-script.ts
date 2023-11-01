import { ContextConsumer } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { testContext } from '../qti-assessment-test.context';

@customElement('test-script')
export class TestScript extends LitElement {
  private operatorFunction: Function;
  private _context: ContextConsumer<any, this>;

  @state()
  private _printed: string = '';

  render() {
    return html`${this._printed}<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  handleSlotChange(event: Event) {
    const commentNode = Array.from(this.childNodes ?? []).find(node => node.nodeType === Node.COMMENT_NODE);
    try {
      this.operatorFunction = new Function('testContext', 'itemContext', commentNode.textContent ?? '');
    } catch (e) {
      console.error('custom-operator contains invalid javascript code', e);
    }
    this._context = new ContextConsumer(
      this,
      testContext,
      testContext => {
        this._printed = this.operatorFunction(testContext, testContext.items[testContext.itemIndex]);
      },
      true
    );
  }
}
