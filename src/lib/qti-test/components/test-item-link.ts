import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TestComponent } from './test-component.abstract';
import * as styles from './styles';

@customElement('test-item-link')
export class TestItemLink extends TestComponent {
  static styles = css`
    :host {
      ${styles.btn};
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
    this.dispatchEvent(
      new CustomEvent('qti-request-test-item', {
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
    'test-item-link': TestItemLink;
  }
}
