import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { controlStyles as styles } from '@citolab/qti-components/qti-test/plugin-api';
import { dispatchPublic } from '@citolab/qti-components/qti-test/plugin-api';

export class TestItemLink extends LitElement {
  static override styles = styles.button;

  @property({ type: String, attribute: 'item-id' })
  private itemId: string = null;

  constructor() {
    super();
    this.addEventListener('click', () => this._requestItem(this.itemId));
  }

  protected _requestItem(identifier: string): void {
    dispatchPublic(this, 'qc-test-navigate', { type: 'item', id: identifier });
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
