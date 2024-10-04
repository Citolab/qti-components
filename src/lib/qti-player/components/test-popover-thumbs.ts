/* eslint-disable lit-a11y/click-events-have-key-events */

import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { sessionContext, SessionContext, testContext, TestContext } from '../../qti-test';

@customElement('test-popover-thumbs')
export class TestPopOverThumbs extends LitElement {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: sessionContext, subscribe: true })
  protected _sessionContext?: SessionContext;

  @property({ type: String, attribute: 'info-category' })
  private infoCategory = null;

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
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
    const { items } = this._testContext;

    return html`<div class="mt-1 flex justify-between gap-8 p-4 text-sky-800">
      <button
        @click=${() => this.hidePopover()}
        class="flex cursor-pointer gap-2 rounded border-none bg-white p-2 text-lg  font-bold text-sky-800  shadow-sm outline-none ring-transparent"
      >
        <hi-24-outline-x-mark class="h-6 w-6 stroke-[2px]"></hi-24-outline-x-mark>
      </button>
      <test-navigation-thumbs>
        <slot @qti-test-set-item=${() => this.hidePopover()}></slot>
      </test-navigation-thumbs>
    </div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-popover-thumbs': TestPopOverThumbs;
  }
}
