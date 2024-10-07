import { css, html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-next')
export class TestNext extends LitElement {
  static styles = css`
    :host,
    button {
      all: unset;
      display: flex;
      align-items: center;
    }
    :host([disabled]),
    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `;

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @property({ type: Boolean, reflect: true, attribute: 'disabled' })
  isLastItem = false;

  _requestItem(identifier: string) {
    if (this.isLastItem) return; // Prevent dispatching event if it's the last item
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
    const nextItemIndex = Math.min(itemIndex + 1, items.length - 1);
    const newIdenfier = items[nextItemIndex]?.identifier;
    this.isLastItem = itemIndex === items.length - 1; // Check if it's the last item
    return html`
      <button
        part="button"
        @click=${_ => this._requestItem(newIdenfier)}
        id="${newIdenfier}"
        ?disabled=${this.isLastItem}
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-next': TestNext;
  }
}
