import { css, html, LitElement } from 'lit';

import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '..';

@customElement('test-prev')
export class TestPrev extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @property({ type: Boolean, reflect: true, attribute: 'disabled' })
  isFirstItem = false;

  _requestItem(identifier: string) {
    if (this.isFirstItem) return; // Prevent dispatching event if it's the first item
    this.dispatchEvent(
      new CustomEvent('qti-test-set-item', {
        composed: true,
        bubbles: true,
        detail: identifier
      })
    );
  }

  static styles = css`
    :host,
    button {
      all: unset;
    }

    :host([disabled]),
    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `;

  render() {
    const { items } = this._testContext;
    const itemIndex = items.findIndex(item => item.identifier === this._sessionContext.identifier);
    const prevItemIndex = Math.max(itemIndex - 1, 0);
    const newIdenfier = items[prevItemIndex]?.identifier;
    this.isFirstItem = itemIndex === 0; // Check if it's the first item
    return html`
      <button
        part="button"
        @click=${_ => this._requestItem(newIdenfier)}
        id="${newIdenfier}"
        ?disabled=${this.isFirstItem}
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-prev': TestPrev;
  }
}
