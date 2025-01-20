import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { TestContext } from '../../../exports/test.context';
import { testContext } from '../../../exports/test.context';

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
  @property({ type: String }) title: string;
  @property({ type: Boolean, converter: stringToBooleanConverter }) visible: boolean;
  @property({ type: Boolean, converter: stringToBooleanConverter, attribute: 'keep-together' }) keepTogether: boolean;

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  async connectedCallback(): Promise<void> {
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
