import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
@customElement('qti-test-part')
export class QtiTestPart extends LitElement {
  @property({ type: String }) identifier: string = '';
  @property({ type: String }) title: string = '';
  @property({ type: String }) class: string = '';

  @property({ type: String, attribute: 'navigation-mode' })
  navigationMode: 'linear' | 'nonlinear' = 'nonlinear';

  @property({ type: String, attribute: 'submission-mode' })
  submissionMode: 'individual' | 'simultaneous' = 'individual';

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(
      new Event('qti-test-part-connected', {
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html` <slot></slot>`;
  }
}

if (!customElements.get('qti-test-part')) {
  customElements.define('qti-test-part', QtiTestPart);
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test-part': QtiTestPart;
  }
}
