import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TestContext } from '../context';
import { testContext } from '../context';

@customElement('qti-assessment-test')
export class QtiAssessmentTest extends LitElement {
  @property({ type: String }) identifier: string;
  @property({ type: String }) title: string;

  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(
      new CustomEvent('qti-assessment-test-connected', {
        detail: this,
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html` <slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-test': QtiAssessmentTest;
  }
}
