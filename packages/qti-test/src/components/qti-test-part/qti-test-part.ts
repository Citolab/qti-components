import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
@customElement('qti-test-part')
export class QtiTestPart extends LitElement {
  @property({ type: String }) identifier: string = '';
  override get title(): string {
    return this._title;
  }
  override set title(value: string) {
    this._title = value;
    this.removeAttribute('title');
    this.setAttribute('data-title', value);
  }
  @property({ type: String }) class: string = '';

  @property({ type: String, attribute: 'navigation-mode' })
  navigationMode: 'linear' | 'nonlinear' = 'nonlinear';

  @property({ type: String, attribute: 'submission-mode' })
  submissionMode: 'individual' | 'simultaneous' = 'individual';

  private _title = '';

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

if (!customElements.get('qti-test-part')) {
  customElements.define('qti-test-part', QtiTestPart);
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test-part': QtiTestPart;
  }
}
