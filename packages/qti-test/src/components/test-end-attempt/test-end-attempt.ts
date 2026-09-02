import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { computedContext } from '@qti-components/base';
import { watch } from '@qti-components/utilities';

import * as styles from '../styles';

import type { ComputedContext } from '@qti-components/base';

export class TestEndAttempt extends LitElement {
  @consume({ context: computedContext, subscribe: true })
  @property({ attribute: false })
  protected computedContext: ComputedContext;

  @property({ type: Boolean, reflect: true, attribute: 'disabled' })
  public _internalDisabled = false;

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

  constructor() {
    super();
    this.addEventListener('click', e => {
      e.preventDefault();
      if (!this._internalDisabled) {
        this.dispatchEvent(new CustomEvent('test-end-attempt', { bubbles: true }));
      }
    });
  }

  override willUpdate(_changedProperties: Map<string | number | symbol, unknown>) {
    this.checkDisabled();
  }

  checkDisabled() {
    const testPart = this.computedContext?.testParts.find(testPart => testPart.active);
    if (!testPart) return;
    const sectionItems = testPart.sections.flatMap(section => section.items);
    const itemIndex = sectionItems.findIndex(item => item.active);
    const activeItem = sectionItems[itemIndex];

    if (!activeItem) {
      this._internalDisabled = false;
      return;
    }

    const maxAttempts = activeItem.maxAttempts ?? 1;
    const numAttempts = activeItem.numAttempts || 0;

    // For non-adaptive items, disable when max attempts have been reached
    if (!activeItem.adaptive && maxAttempts > 0 && numAttempts >= maxAttempts) {
      this._internalDisabled = true;
      return;
    }

    if (activeItem.allowSkipping === false) {
      this._internalDisabled = activeItem.valid === false || activeItem.isDefaultResponse;
    } else {
      this._internalDisabled = false;
    }
  }

  override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-end-attempt': TestEndAttempt;
  }
}
