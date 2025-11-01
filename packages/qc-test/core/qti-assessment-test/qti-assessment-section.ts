import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { testContext } from '../../../../src/lib/exports/test.context';

import type { TestContext } from '../../../../src/lib/exports/test.context';

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

  get title(): string {
    return this._title;
  }
  set title(value: string) {
    this._title = value;
    this.removeAttribute('title');
    this.setAttribute('data-title', value);
  }
  @property({ type: Boolean, converter: stringToBooleanConverter }) visible: boolean;
  @property({ type: Boolean, converter: stringToBooleanConverter, attribute: 'keep-together' }) keepTogether: boolean;

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  private _title = '';

  async connectedCallback(): Promise<void> {
    this._title = this.getAttribute('title') || '';
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(
      new Event('qti-assessment-section-connected', {
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
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
