import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TestComponent } from './test-component.abstract';
import * as styles from './styles';

/**
 * Represents a custom element for navigating to the previous test item.
 *
 * @remarks
 * This element provides functionality for navigating to the previous test item.
 *
 * @example
 * ```html
 * <test-prev></test-prev>
 * ```
 */
@customElement('test-prev')
export class TestPrev extends TestComponent {
  static styles = css`
    :host {
      ${styles.btn};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  constructor() {
    super();
    this._internals.role = 'button';
    this._internals.ariaLabel = 'Next item';

    this.addEventListener('click', e => {
      e.preventDefault();
      if (!this.disabled) this._requestItem(this.items[this.itemIndex - 1].identifier);
    });
  }

  willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('_testContext')) {
      this.disabled = !this._testElement?.el || this.itemIndex === 0 || this.itemIndex === -1;
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-previous': TestPrev;
  }
}
