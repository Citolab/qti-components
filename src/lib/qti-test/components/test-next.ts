import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import * as styles from './styles';
import { watch } from '../../decorators';
import { computedContext } from '../../exports/computed.context';

import type { ComputedContext, ComputedItem } from '../../exports/computed.context';

/**
 * Represents a custom element for navigating to the next test item.
 *
 * @remarks
 * This element provides functionality for navigating to the next test item.
 *
 * @example
 * ```html
 * <test-next></test-next>
 * ```
 */
@customElement('test-next')
export class TestNext extends LitElement {
  @property({ type: Boolean, reflect: true, attribute: 'disabled' })
  public _internalDisabled = true;

  @consume({ context: computedContext, subscribe: true })
  protected computedContext: ComputedContext;

  sectionItems: ComputedItem[];
  itemIndex: number;

  @watch('computedContext')
  _handleTestElementChange(_oldValue: ComputedContext, newValue: ComputedContext) {
    if (newValue) {
      this._internalDisabled = false;
    }
  }

  static styles = css`
    :host {
      ${styles.btn};
    }
    :host([disabled]) {
      ${styles.dis};
    }
  `;
  private _internals: ElementInternals;

  constructor() {
    super();

    this._internals = this.attachInternals();
    this._internals.role = 'button';
    this._internals.ariaLabel = 'Next item';

    this.addEventListener('click', e => {
      e.preventDefault();
      if (!this._internalDisabled) this._requestItem(this.sectionItems[this.itemIndex + 1].identifier);
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.checkDisabled();
  }

  willUpdate(_changedProperties: Map<string | number | symbol, unknown>) {
    if (!this.computedContext) return;
    const testPart = this.computedContext?.testParts.find(testPart => testPart.active);
    if (!testPart) return;
    this.sectionItems = testPart.sections.flatMap(section => section.items);
    this.itemIndex = this.sectionItems.findIndex(item => item.active);
    this.checkDisabled();
  }

  checkDisabled() {
    this._internalDisabled =
      !this.computedContext || this.itemIndex < 0 || this.itemIndex >= this.sectionItems?.length - 1;
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

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-next': TestNext;
  }
}
