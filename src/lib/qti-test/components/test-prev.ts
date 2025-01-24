import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';

import * as styles from './styles';
import { propInternalState, watch } from '../../decorators';
import { computedContext } from '../../exports/computed.context';

import type { ComputedContext, ComputedItem } from '../../exports/computed.context';

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
  @propInternalState({
    type: Boolean,
    reflect: true,
    aria: 'ariaDisabled' // Maps to `aria-disabled` attribute
  })
  public disabled = true;

  @consume({ context: computedContext, subscribe: true })
  private computedContext: ComputedContext;

  sectionItems: ComputedItem[];
  itemIndex: number;

  @watch('computedContext')
  _handleTestElementChange(_oldValue: ComputedContext, newValue: ComputedContext) {
    if (newValue) {
      this.disabled = false;
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
      if (!this.disabled) this._requestItem(this.sectionItems[this.itemIndex - 1].identifier);
    });
  }

  willUpdate(_changedProperties: Map<string | number | symbol, unknown>) {
    if (!this.computedContext) return;
    const testPart = this.computedContext?.testParts.find(testPart => testPart.active);
    this.sectionItems = testPart.sections.flatMap(section => section.items);
    this.itemIndex = this.sectionItems.findIndex(item => item.active);
    this.checkDisabled();
  }

  checkDisabled() {
    this.disabled = !this.computedContext || this.itemIndex === 0 || this.itemIndex === -1;
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
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-previous': TestPrev;
  }
}
