import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import * as styles from '../styles';
import { dispatchPublic } from '../../public-events';

export class TestItemLink extends LitElement {
  static override styles = css`
    :host {
      ${styles.btn};
    }
    @media (hover: hover) and (pointer: fine) {
      :host(:hover:not([disabled])) {
        ${styles.btnInteractive};
      }
    }
    :host(:active:not([disabled])) {
      ${styles.btnActive};
    }
    :host(:focus-visible) {
      ${styles.focusRing};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  @property({ type: String, attribute: 'item-id' })
  private itemId: string = null;

  constructor() {
    super();
    this.addEventListener('click', () => this._requestItem(this.itemId));
  }

  protected _requestItem(identifier: string): void {
    dispatchPublic(this, 'cito-test-navigate', { type: 'item', id: identifier });
  }

  override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-item-link': TestItemLink;
  }
}
