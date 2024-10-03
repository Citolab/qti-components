import { html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';
@customElement('test-show-index')
export class TestShowIndex extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  _requestItem(index) {
    this.dispatchEvent(
      new CustomEvent('on-test-request-item', {
        composed: true,
        bubbles: true,
        detail: index
      })
    );
  }

  render() {
    const { items } = this._testContext;
    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);

    return html`<span part="index">${itemIndex + 1}</span>/<span part="total">${items.length}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-show-index': TestShowIndex;
  }
}
