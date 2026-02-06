import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { testContext } from '@qti-components/base';

import type { TestContext } from '@qti-components/base';

@customElement('qti-assessment-test')
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
    await this.updateComplete;
    this.dispatchEvent(
      new CustomEvent('qti-assessment-test-connected', {
        detail: this,
        bubbles: true,
        composed: true
      })
    );
  }

  override render() {
    return html` <slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-test': QtiAssessmentTest;
  }
}
