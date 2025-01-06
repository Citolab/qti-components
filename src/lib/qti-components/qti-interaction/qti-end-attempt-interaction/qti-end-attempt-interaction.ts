import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
@customElement('qti-end-attempt-interaction')
export class QtiEndAttemptInteraction extends LitElement {
  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier;

  @property({ reflect: true, type: Boolean }) disabled = false;

  @property({ type: String, attribute: 'count-attempt' })
  public countAttempt: 'true' | 'false';

  @property({ type: String })
  public title: string = 'end attempt';

  override render() {
    return html`<button ?disabled=${this.disabled} part="button" @click=${this.endAttempt}>${this.title}</button>`;
  }
  public endAttempt(_: Event) {
    this.dispatchEvent(
      new CustomEvent('end-attempt', {
        bubbles: true,
        composed: true,
        detail: { responseIdentifier: this.responseIdentifier, countAttempt: this.countAttempt === 'true' }
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-end-attempt-interaction': QtiEndAttemptInteraction;
  }
}
