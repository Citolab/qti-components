import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export class QtiTestPart extends LitElement {
  @property({ type: String }) identifier: string = '';
  override get title(): string {
    return this.#title;
  }
  override set title(value: string) {
    this.#title = value;
    this.removeAttribute('title');
    this.setAttribute('data-title', value);
  }
  @property({ type: String }) class: string = '';

  @property({ type: String, attribute: 'navigation-mode' })
  navigationMode: 'linear' | 'nonlinear' = 'nonlinear';

  @property({ type: String, attribute: 'submission-mode' })
  submissionMode: 'individual' | 'simultaneous' = 'individual';

  #title = '';

  override async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(
      new Event('qti-test-part-connected', {
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
    'qti-test-part': QtiTestPart;
  }
}
