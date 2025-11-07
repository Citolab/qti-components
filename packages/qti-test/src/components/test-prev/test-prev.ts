import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { watch } from '@qti-components/utilities';
import { computedContext } from '@qti-components/base';

import * as styles from '../styles';

import type { ComputedContext, ComputedItem } from '@qti-components/base';

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
export class TestPrev extends LitElement {
  @property({ type: Boolean, reflect: true, attribute: 'disabled' })
  public _internalDisabled = true;

  @consume({ context: computedContext, subscribe: true })
  private computedContext: ComputedContext;

  sectionItems: ComputedItem[];
  itemIndex: number;

  @watch('computedContext')
  _handleTestElementChange(_oldValue: ComputedContext, newValue: ComputedContext) {
    if (newValue) {
      this._internalDisabled = false;
    }
  }

  static override styles = css`
    :host {
      ${styles.btn};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;

  constructor() {
    super();

    this.addEventListener('click', e => {
      e.preventDefault();
      if (!this._internalDisabled) this._requestItem(this.sectionItems[this.itemIndex - 1].identifier);
    });
  }

  override willUpdate(_changedProperties: Map<string | number | symbol, unknown>) {
    if (!this.computedContext) return;
    const testPart = this.computedContext?.testParts.find(testPart => testPart.active);
    if (!testPart) return;
    this.sectionItems = testPart.sections.flatMap(section => section.items);
    this.itemIndex = this.sectionItems.findIndex(item => item.active);
    this.checkDisabled();
  }

  checkDisabled() {
    this._internalDisabled = !this.computedContext || this.itemIndex === 0 || this.itemIndex === -1;
  }

  protected _requestItem(identifier: string): void {
    this.dispatchEvent(
      new CustomEvent('qti-request-navigation', {
        composed: true,
        bubbles: true,
        detail: {
          type: 'item',
          id: identifier
        }
      })
    );
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-previous': TestPrev;
  }
}
