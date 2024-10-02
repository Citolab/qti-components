import { html, LitElement } from 'lit';

import { consume, ContextConsumer } from '@lit/context';
import { customElement, state } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';
@customElement('test-script')
export class TestScript extends LitElement {
  private operatorFunction: Function;

  // @consume({ context: testContext, subscribe: true })
  // public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @state()
  private _printed: string = '';

  private _testContext: ContextConsumer<{ __context__: TestContext }, this>;

  render() {
    return html`${this._printed}<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  handleSlotChange(event: Event) {
    const commentNode = Array.from(this.childNodes ?? []).find(node => node.nodeType === Node.COMMENT_NODE);
    try {
      this.operatorFunction = new Function('testContext', 'itemContext', 'itemIndex', commentNode.textContent ?? '');
    } catch (e) {
      console.error('custom-operator contains invalid javascript code', e);
    }

    this._testContext = new ContextConsumer(this, {
      context: testContext,
      subscribe: true,
      callback: testContext => {
        const { items } = testContext;
        const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);

        this._printed = this.operatorFunction(testContext, testContext.items[itemIndex], testContext);
      }
    });

    // const { items } = this._testContext.value;
    // const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);
  }
}
