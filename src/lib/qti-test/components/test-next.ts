import { css, html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-next')
export class TestNext extends LitElement {
  static styles = css`
    :host {
      all: unset;
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
  `;

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  private _internals: ElementInternals;

  updated() {
    const { items } = this._testContext;
    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);
    itemIndex === items.length - 1 ? this._internals.states.add('disabled') : this._internals.states.delete('disabled');
  }

  constructor() {
    super();
    this._internals = this.attachInternals();

    this.addEventListener('click', () => {
      const { items } = this._testContext;
      const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);
      const nextItemIndex = Math.min(itemIndex + 1, items.length - 1);
      const newIdenfier = items[nextItemIndex]?.identifier;
      const lastItem = itemIndex === items.length - 1;
      if (!lastItem) this._requestItem(newIdenfier);
    });
  }

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
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-next': TestNext;
  }
}
