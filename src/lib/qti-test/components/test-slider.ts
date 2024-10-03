import { css, html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-slider')
export class TestSlider extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  static styles = css`
    input {
      width: 100%;
    }
  `;

  _requestItem(index) {
    const { items } = this._testContext;

    this.dispatchEvent(
      new CustomEvent('qti-test-set-item', {
        composed: true,
        bubbles: true,
        detail: items[index].identifier
      })
    );
  }

  render() {
    const { items } = this._testContext;
    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);

    return html`
      <input
        part="input"
        type="range"
        value=${itemIndex.toString()}
        max=${items.length - 1}
        @input=${e => this._requestItem(+(e.target as HTMLInputElement).value)}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-slider': TestSlider;
  }
}
