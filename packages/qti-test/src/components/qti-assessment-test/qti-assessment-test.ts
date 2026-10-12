import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { testContext } from '@qti-components/base';

import { dispatchPublic } from '../../public-events';

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
    await this.updateComplete;
    dispatchPublic(this, 'cito-test-loaded', this);
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

declare module '../../public-events' {
  interface PublicEventMap {
    'cito-test-loaded': CustomEvent<QtiAssessmentTest>;
  }
}
