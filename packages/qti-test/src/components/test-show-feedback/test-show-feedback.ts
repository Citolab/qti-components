import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';

import { watch } from '@qti-components/utilities';
import { computedContext, sessionContext } from '@qti-components/base';

import * as styles from '../styles';

import type { ComputedContext, SessionContext } from '@qti-components/base';

/**
 * Navigates the candidate to an `access="atEnd"` qti-test-feedback once it has
 * become available (its end-of-part / end-of-test outcome has matched). The
 * button is disabled until then, so a host can keep it hidden until enabled.
 *
 * Clicking dispatches a `feedback` navigation request, which clears the current
 * assessment item and shows the feedback. Navigating to any item afterwards (or
 * moving into a later test-part) hides the feedback again.
 *
 * @example
 * ```html
 * <test-show-feedback>How Did I Do?</test-show-feedback>
 * ```
 */
export class TestShowFeedback extends LitElement {
  @property({ type: Boolean, reflect: true, attribute: 'disabled' })
  public _internalDisabled = true;

  @consume({ context: computedContext, subscribe: true })
  private computedContext: ComputedContext;

  @consume({ context: sessionContext, subscribe: true })
  private sessionContext: SessionContext;

  /** Identifier of the feedback to navigate to, set whenever one is available. */
  #feedbackId: string | null = null;

  @watch('computedContext')
  _handleComputedContextChange(_oldValue: ComputedContext, newValue: ComputedContext) {
    if (newValue) this.requestUpdate();
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
    this.#internals.ariaLabel = 'Show feedback';

    this.addEventListener('click', e => {
      e.preventDefault();
      if (!this._internalDisabled && this.#feedbackId) this._requestFeedback(this.#feedbackId);
    });
  }

  override willUpdate(_changedProperties: Map<string | number | symbol, unknown>) {
    // The relevant feedback is one available for the active test-part, or a
    // test-root feedback (partId null) shown at the end of the whole test.
    const activePartId = this.sessionContext?.navPartId ?? null;
    const candidate = this.computedContext?.availableFeedbacks?.find(
      fb => fb.partId === null || fb.partId === activePartId
    );

    this.#feedbackId = candidate?.identifier ?? null;
    // Disabled with no feedback to offer, or while the candidate is already
    // viewing that feedback — there is nowhere new to navigate.
    const alreadyViewing = this.#feedbackId === (this.sessionContext?.navFeedbackIdentifier ?? null);
    this._internalDisabled = !this.#feedbackId || alreadyViewing;
  }

  protected _requestFeedback(identifier: string): void {
    this.dispatchEvent(
      new CustomEvent('qti-request-navigation', {
        composed: true,
        bubbles: true,
        detail: {
          type: 'feedback',
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
    'test-show-feedback': TestShowFeedback;
  }
}
