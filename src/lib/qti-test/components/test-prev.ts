import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';

import * as styles from './styles';
import { computedContext } from '../../exports/computed.context';

import type { ComputedContext, ComputedItem } from '../../exports/computed.context';

@customElement('test-prev')
export class TestPrev extends LitElement {
  /**
   * External input: allows parent to disable this element.
   */
  @property({ type: Boolean })
  public disabled = false;

  /**
   * Internal logic + external flag = effective disabled state (reflected)
   */
  @property({ type: Boolean, reflect: true, attribute: 'disabled' })
  public get _effectiveDisabled(): boolean {
    return this._internallyDisabled || this.disabled;
  }

  private set _effectiveDisabled(_: boolean) {
    // no-op setter to satisfy reflect binding; computed internally
  }

  @consume({ context: computedContext, subscribe: true })
  private computedContext: ComputedContext;

  sectionItems: ComputedItem[] = [];
  itemIndex = -1;

  @state()
  private _internallyDisabled = true;

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
    this._internals.ariaLabel = 'Previous item';

    this.addEventListener('click', e => {
      e.preventDefault();
      if (!this._effectiveDisabled) {
        const prev = this.sectionItems[this.itemIndex - 1];
        if (prev) this._requestItem(prev.identifier);
      }
    });
  }

  willUpdate() {
    if (!this.computedContext) return;

    const testPart = this.computedContext.testParts.find(testPart => testPart.active);
    if (!testPart) return;

    this.sectionItems = testPart.sections.flatMap(section => section.items);
    this.itemIndex = this.sectionItems.findIndex(item => item.active);

    this._updateInternalDisabledState();
  }

  updated() {
    if (this._effectiveDisabled) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  private _updateInternalDisabledState() {
    this._internallyDisabled = !this.computedContext || this.itemIndex === 0 || this.itemIndex === -1;
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
    'test-prev': TestPrev;
  }
}
