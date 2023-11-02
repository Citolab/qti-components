import { css, html, LitElement } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { TestContext, testContext } from '../qti-assessment-test.context';

@customElement('test-next')
export class TestNext extends LitElement {
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
    const nextItemIndex = Math.min(itemIndex + 1, items.length - 1);
    return html`
      <button part="button" @click=${_ => this._requestItem(nextItemIndex)} id="${items[nextItemIndex]?.identifier}">
        <slot></slot>
      </button>
    `;
  }
}
