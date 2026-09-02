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

  #sessionControlAllowsFeedback(): boolean {
    // If show-feedback isn't set to true, we need to hide it after max-attempts
    if (!this._computedContext) return true;
    const activeItem = this._computedContext.testParts
      ?.find(tp => tp.active)
      ?.sections.flatMap(s => s.items)
      .find(i => i.active);
    if (!activeItem || activeItem.showFeedback) return true;
    const maxAttempts = activeItem.maxAttempts ?? 1;
    const numAttempts = Number(this._context?.variables?.find(v => v.identifier === 'numAttempts')?.value) || 0;
    return numAttempts < maxAttempts;
  }
}
