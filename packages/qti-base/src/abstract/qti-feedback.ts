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
   * So the question is whether the item is out of attempts, and that is answered
   * differently per item kind:
   *  - adaptive items ignore max-attempts entirely; completionStatus bounds them;
   *  - `max-attempts="0"` means no limit, so the state is never reached.
   */
  #sessionControlAllowsFeedback(): boolean {
    if (!this._computedContext) return true;
    const activeItem = this._computedContext.testParts
      ?.find(tp => tp.active)
      ?.sections.flatMap(s => s.items)
      .find(i => i.active);
    if (!activeItem) return true;

    const maxAttempts = activeItem.maxAttempts ?? 1;
    const numAttempts = Number(this._context?.variables?.find(v => v.identifier === 'numAttempts')?.value) || 0;

    const outOfAttempts = activeItem.adaptive
      ? activeItem.completionStatus === 'completed'
      : maxAttempts > 0 && numAttempts >= maxAttempts;

    // `show-feedback` defaults to false per the spec, so an absent value suppresses.
    return !outOfAttempts || activeItem.showFeedback === true;
  }
}
