import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { testContext } from '@qti-components/base';

import type { QtiTestFeedback } from '../qti-test-feedback/qti-test-feedback';
import type { TestContext } from '@qti-components/base';

export class QtiAssessmentTest extends LitElement {
  @property({ type: String }) identifier: string;
  @property({ type: String })
  override get title(): string {
    return this.#title;
  }
  override set title(value: string) {
    this.#title = value;
    this.removeAttribute('title');
    this.setAttribute('data-title', value);
  }

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;
  #title = '';

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.addEventListener('qti-test-outcome-changed', this.#handleTestOutcomeChanged);
    await this.updateComplete;
    this.dispatchEvent(
      new CustomEvent('qti-assessment-test-connected', {
        detail: this,
        bubbles: true,
        composed: true
      })
    );
  }

  override disconnectedCallback(): void {
    this.removeEventListener('qti-test-outcome-changed', this.#handleTestOutcomeChanged);
    super.disconnectedCallback();
  }

  /**
   * Outcome processing has run, so give every test feedback below this element a
   * chance to re-evaluate. The flags travel with the event rather than being
   * re-derived here: only the run that concluded a part or the test can satisfy
   * `access="atEnd"`, and only feedback scoped to that part should respond.
   */
  #handleTestOutcomeChanged = (e: QtiTestOutcomeChangedEvent): void => {
    const atEnd = e.detail.atEnd === true;
    const partId = e.detail.partId ?? null;
    this.querySelectorAll<QtiTestFeedback>('qti-test-feedback').forEach(fb => {
      fb.checkShowFeedback(fb.outcomeIdentifier, { atEnd, partId });
    });
  };

  override render() {
    return html` <slot></slot>`;
  }
}

export type QtiTestOutcomeChangedEvent = CustomEvent<{ atEnd?: boolean; partId?: string | null }>;

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-test': QtiAssessmentTest;
  }
  interface GlobalEventHandlersEventMap {
    'qti-test-outcome-changed': QtiTestOutcomeChangedEvent;
  }
}
