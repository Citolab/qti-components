/* eslint-disable lit-a11y/click-events-have-key-events */

import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('test-item-link')
export class TestItemLink extends LitElement {
  static styles = css`
    :host {
      display: block;
      user-select: none;
      cursor: pointer;
    }
  `;

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
