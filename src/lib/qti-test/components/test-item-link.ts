import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { TestComponent } from './test-component.abstract';

@customElement('test-item-link')
export class TestItemLink extends TestComponent {
  @property({ type: String, attribute: 'item-id' })
  private itemId: string = null;

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
