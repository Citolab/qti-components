import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import * as styles from '../styles';
import { dispatchPublic } from '../../public-events';

export class TestItemLink extends LitElement {
  static override styles = styles.button;

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
    return styles.control;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-item-link': TestItemLink;
  }
}
