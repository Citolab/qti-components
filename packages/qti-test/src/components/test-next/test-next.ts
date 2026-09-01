import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { watch } from '@qti-components/utilities';
import { computedContext } from '@qti-components/base';

import * as styles from '../styles';

import type { ComputedContext, ComputedItem } from '@qti-components/base';

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
      this.requestUpdate();
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
  #internals: ElementInternals;

  constructor() {
    super();

    this.#internals = this.attachInternals();
    this.#internals.role = 'button';
    this.#internals.ariaLabel = 'Next item';

    this.addEventListener('click', e => {
      e.preventDefault();
      if (!this._internalDisabled) this._requestItem(this.sectionItems[this.itemIndex + 1].identifier);
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.checkDisabled();
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
    const testPart = this.computedContext?.testParts.find(testPart => testPart.active);
    if (!testPart) return;
    const activeSection = testPart.sections.find(s => s.active);
    const navigationMode = activeSection?.navigationMode || testPart.navigationMode;
    const submissionMode = activeSection?.submissionMode || testPart.submissionMode;
    const activeItem = this.sectionItems[this.itemIndex];

    const isLinearIndividual = navigationMode === 'linear' && submissionMode === 'individual';

    // In linear/individual mode each item is submitted before the candidate
    // leaves it, so Next stays locked until an attempt has been ended.
    // numAttempts only increments in processResponse, so a mid-attempt
    // selection can never unlock it.
    const numAttempts = Number(activeItem?.variables.find(v => v.identifier === 'numAttempts')?.value) || 0;

    this._internalDisabled =
      !this.computedContext ||
      this.itemIndex < 0 ||
      this.itemIndex >= (this.sectionItems?.length ?? 0) - 1 ||
      (isLinearIndividual && numAttempts === 0);
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
    'test-next': TestNext;
  }
}
