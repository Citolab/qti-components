/* eslint-disable lit-a11y/click-events-have-key-events */

import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('test-item-link')
export class TestItemLink extends LitElement {
  @property({ type: String, attribute: 'item-id' })
  private itemId: string = null;

  private _requestItem(identifier: string) {
    this.dispatchEvent(
      new CustomEvent('qti-test-set-item', {
        composed: true,
        bubbles: true,
        detail: identifier
      })
    );
  }

  constructor() {
    super();
    this.addEventListener('click', () => this._requestItem(this.itemId));
  }

  render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-item-link': TestItemLink;
  }
}
