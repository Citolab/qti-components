import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { testContext } from '@qti-components/base';

import type { TestContext } from '@qti-components/base';

// https://www.imsglobal.org/sites/default/files/spec/qti/v3/info/index.html#Root_AssessmentSection

const stringToBooleanConverter = {
  fromAttribute(value: string): boolean {
    return value === 'true';
  },
  toAttribute(value: boolean): string {
    return value ? 'true' : 'false';
  }
};

export class QtiAssessmentSection extends LitElement {
  @property({ type: String }) identifier: string;
  @property({ type: String }) required: string;
  @property({ type: Boolean, converter: stringToBooleanConverter }) fixed: boolean;

  override get title(): string {
    return this.#title;
  }
  override set title(value: string) {
    this.#title = value;
    this.removeAttribute('title');
    this.setAttribute('data-title', value);
  }
  @property({ type: Boolean, converter: stringToBooleanConverter }) visible: boolean;
  @property({ type: Boolean, converter: stringToBooleanConverter, attribute: 'keep-together' }) keepTogether: boolean;

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  #title = '';

  override async connectedCallback(): Promise<void> {
    this.#title = this.getAttribute('title') || '';
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(
      new Event('qti-assessment-section-connected', {
        bubbles: true,
        composed: true
      })
    );
  }

  override render() {
    return html`<slot name="qti-rubric-block"></slot><slot></slot>`;
  }
}

if (!customElements.get('qti-assessment-section')) {
  customElements.define('qti-assessment-section', QtiAssessmentSection);
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-section': QtiAssessmentSection;
  }
}
