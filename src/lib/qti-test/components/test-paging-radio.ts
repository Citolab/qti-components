import { html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';
@customElement('test-paging-radio')
export class TestPagingRadio extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  // protected createRenderRoot() {
  //   return this;
  // }

  _requestItem(identifier: string) {
    this.dispatchEvent(
      new CustomEvent('qti-test-set-item', {
        composed: true,
        bubbles: true,
        detail: identifier
      })
    );
  }

  render() {
    const { items } = this._testContext;
    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);

    return html`
      ${items.map(
        (item, index) =>
          html` <label>
            <input
              type="radio"
              part="input"
              name="item"
              value="${index}"
              ?checked=${index === itemIndex}
              @change=${_ => items[index].identifier}
              @click=${_ => {
                this._requestItem(item.identifier);
              }}
              data-completion-status=${item.variables.find(v => v.identifier === 'completionStatus')?.value}
              id="${item.identifier}"
            />
          </label>`
      )}
    `;
  }
}
