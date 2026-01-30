import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
export class QtiEndAttemptInteraction extends LitElement {
  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string;

  @property({ reflect: true, type: Boolean }) disabled = false;

  /** Defines the number of attempts that a user can make using the 'endAttemptInteraction' mechanism (this can be used to limit the number of hints, etc.). [More information](https://www.imsglobal.org/sites/default/files/spec/qti/v3/info/index.html#DataCharacteristic_EndAttemptInteraction.Attr_count-attempt) */
  @property({ type: String, attribute: 'count-attempt' })
  public countAttempt: 'true' | 'false' | null = null;

  @property({ type: String })
  public override title: string = 'end attempt';

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
