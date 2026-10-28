import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import { itemContext } from '@qti-components/base';

import styles from './qti-end-attempt-interaction.styles';

import type { CSSResultGroup } from 'lit';
import type { ItemContext } from '@qti-components/base';
/**
 * A button that ends the current attempt.
 *
 * It follows its item: it cannot be pressed while the item is `disabled` or `readonly`, or once an
 * adaptive item is done. An adaptive item that sets `completionStatus` to `completed` closes its
 * session, so no further attempt can start (QTI info model §2.5).
 *
 * @csspart button - The end-attempt button element.
 *
 * No states: the element has no internals; `disabled` and `readonly` are read off the item and
 * land on the button's `disabled` attribute.
 */
export class QtiEndAttemptInteraction extends LitElement {
  static override styles: CSSResultGroup = styles;

  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string;

  @property({ reflect: true, type: Boolean }) disabled = false;

  @consume({ context: itemContext, subscribe: true })
  @state()
  private _itemContext?: ItemContext;

  /** The item says no attempt can end here: it is locked, shown for reading, or an adaptive item that is done. */
  get #closedByItem(): boolean {
    const context = this._itemContext;
    if (!context) return false;
    if (context.disabled || context.readonly) return true;
    const adaptive = this.closest('qti-assessment-item')?.getAttribute('adaptive') === 'true';
    const completionStatus = context.variables?.find(v => v.identifier === 'completionStatus')?.value;
    return adaptive && completionStatus === 'completed';
  }

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
    return html`<button ?disabled=${this.disabled || this.#closedByItem} part="button" @click=${this.endAttempt}>
      ${this.title}
    </button>`;
  }
  public endAttempt(_: Event) {
    if (this.disabled || this.#closedByItem) return;
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
