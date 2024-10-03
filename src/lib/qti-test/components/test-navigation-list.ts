import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';
import { QtiItem } from '../qti-item';

@customElement('test-navigation-list')
export class TestNavigationList extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

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
    return html`<slot
      @pointerdown=${({ target }: { target: QtiItem }) => this._requestItem(target.identifier)}
      @qti-ext-item-first-updated=${e => e.stopPropagation()}
    ></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-navigation-list': TestNavigationList;
  }
}
