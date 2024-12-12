import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Interaction } from '../internal/interaction/interaction';
@customElement('qti-end-attempt-interaction')
export class QtiEndAttemptInteraction extends Interaction {
  @property({ type: String, attribute: 'count-attempt' })
  public countAttempt: string = 'true';

  @property({ type: String })
  public title: 'end attempt';

  validate(): boolean {
    // not implemented by design
    return true;
  }

  get value(): string | string[] {
    // throw new Error('Method not implemented.');
    return '';
  }

  set value(_: string | string[]) {
    // not implemented by design
  }

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
