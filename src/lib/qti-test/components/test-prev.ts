import { css, html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-prev')
export class TestPrev extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }
    :host(:state(disabled)) {
      cursor: not-allowed;
      opacity: 0.5;
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
    itemIndex === 0 ? this._internals.states.add('disabled') : this._internals.states.delete('disabled');
  }

  constructor() {
    super();
    this._internals = this.attachInternals();

    this.addEventListener('click', () => {
      const { items } = this._testContext;
      const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);
      const prevItemIndex = Math.max(itemIndex - 1, 0);
      const newIdenfier = items[prevItemIndex]?.identifier;
      const isFirstItem = itemIndex === 0; // Check if it's the first item
      if (!isFirstItem) this._requestItem(newIdenfier);
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
    'test-prev': TestPrev;
  }
}
