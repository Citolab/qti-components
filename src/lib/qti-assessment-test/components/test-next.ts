import { css, html, LitElement } from 'lit';

import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit-labs/context';
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
    const item = items[itemIndex + 1];
    return html`
      <button @click=${_ => this._requestItem(itemIndex + 1)} id="${item.identifier}">
        ${item.identifier}<br />${item.variables.find(v => v.identifier === 'completionStatus')?.value}
        <br />${item.variables.find(v => v.identifier === 'SCORE')?.value}
      </button>
    `;
  }
}
