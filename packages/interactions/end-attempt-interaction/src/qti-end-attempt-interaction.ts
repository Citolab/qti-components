import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import styles from './qti-end-attempt-interaction.styles';

import type { CSSResultGroup } from 'lit';
/**
 * A button that ends the current attempt.
 *
 * @csspart button - The end-attempt button element.
 */
export class QtiEndAttemptInteraction extends LitElement {
  static override styles: CSSResultGroup = styles;

  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string;

  @property({ reflect: true, type: Boolean }) disabled = false;

  /**
   * Whether ending the attempt with this button counts as an attempt (`numAttempts` goes up), so it
   * uses up one of the item's `max-attempts`. Only `"false"` does not count: a hint button that
   * should not use up an attempt says so. QTI 3 gives the attribute no default; an absent value counts,
   * as QTI 2.x's default `true` did and as amp-up and QTI.JS do.
   * [More information](https://www.imsglobal.org/spec/qti/v3p0/info#Data_EndAttemptInteraction)
   */
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
        detail: { responseIdentifier: this.responseIdentifier, countAttempt: this.countAttempt !== 'false' }
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-end-attempt-interaction': QtiEndAttemptInteraction;
  }
}
