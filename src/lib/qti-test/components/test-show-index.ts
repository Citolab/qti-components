import { css, html, LitElement } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('test-show-index')
export class TestShowIndex extends LitElement {
  @consume({ context: testContext, subscribe: true })
  @state()
  public _testContext?: TestContext;

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
    const { items, itemIndex } = this._testContext;
    const item = items[itemIndex - 1];
    return html` ${itemIndex + 1}/${items.length} `;
  }
}
