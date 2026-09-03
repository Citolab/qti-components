import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import { computedContext } from '../context/computed.context';
import { itemContext } from '../context/item.context';
import { IsNullOrUndefined } from '../utils/utils';

import type { ComputedContext } from '../context/types/computed.types';
import type { ItemContext } from '../context/types/item.types';

export abstract class QtiFeedback extends LitElement {
  @property({ type: String, attribute: 'show-hide' })
  protected showHide: 'show' | 'hide' = 'show';

  @property({ type: String, attribute: 'outcome-identifier' })
  public outcomeIdentifier: string;

  @property({ type: String })
  protected identifier: string;

  @property({ type: String, attribute: false })
  public showStatus: string;

  @consume({ context: itemContext, subscribe: true })
  @state()
  private _context?: ItemContext;

  @consume({ context: computedContext, subscribe: true })
  @state()
  private _computedContext?: ComputedContext;

  public override connectedCallback() {
    super.connectedCallback();
    this.dispatchEvent(
      new CustomEvent<QtiFeedback>('qti-register-feedback', {
        bubbles: true,
        composed: true,
        detail: this
      })
    );
  }

  public checkShowFeedback(outcomeIdentifier: string) {
    const outcomeVariable = this._context.variables.find(v => v.identifier === outcomeIdentifier) || null;
    if (this.outcomeIdentifier !== outcomeIdentifier || !outcomeVariable) return;
    let isFound = false;
    if (Array.isArray(outcomeVariable.value)) {
      isFound = outcomeVariable.value.includes(this.identifier);
    } else {
      isFound =
        (!IsNullOrUndefined(this.identifier) &&
          !IsNullOrUndefined(outcomeVariable?.value) &&
          this.identifier === outcomeVariable.value) ||
        false;
    }

    this.#showFeedback(isFound);
  }

  #showFeedback(value: boolean) {
    if (!this.#sessionControlAllowsFeedback()) {
      this.showStatus = 'off';
      return;
    }
    this.showStatus = (value && this.showHide === 'show') || (!value && this.showHide === 'hide') ? 'on' : 'off';
  }

  /**
   * The QTI `show-feedback` constraint governs exactly one state: after the end of
   * the last attempt. Up to that point the spec requires any applicable feedback to
   * be shown — "a value of max-attempts greater than 1, by definition, indicates
   * that any applicable feedback must be shown" — and only "once the maximum number
   * of allowed attempts have been used (or for adaptive items, completionStatus has
   * been set to completed)" does `show-feedback` decide.
   *
   * This only ever forces feedback off, so `show-feedback` being true settles it:
   * there is no state in which the constraint hides feedback. It defaults to
   * false, and an absent value suppresses once the attempts are gone.
   *
   * That leaves one question — is the item out of attempts? — and the two item
   * kinds answer it from different variables, so each reads only its own.
   */
  #sessionControlAllowsFeedback(): boolean {
    if (!this._computedContext) return true;
    const activeItem = this._computedContext.testParts
      ?.find(tp => tp.active)
      ?.sections.flatMap(s => s.items)
      .find(i => i.active);
    if (!activeItem || activeItem.showFeedback) return true;

    // Adaptive items ignore max-attempts: "the number of attempts is limited by
    // the value of the completionStatus built-in outcome variable".
    if (activeItem.adaptive) return activeItem.completionStatus !== 'completed';

    // `max-attempts="0"` is "no limit", so the last attempt never arrives.
    const maxAttempts = activeItem.maxAttempts ?? 1;
    if (maxAttempts <= 0) return true;

    const numAttempts = Number(this._context?.variables?.find(v => v.identifier === 'numAttempts')?.value) || 0;
    return numAttempts < maxAttempts;
  }
}
