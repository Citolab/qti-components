import { consume } from '@lit/context';
import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { IsNullOrUndefined } from '../internal/utils';
import type { ItemContext } from '../qti-assessment-item/qti-assessment-item.context';
import { itemContext } from '../qti-assessment-item/qti-assessment-item.context';

export abstract class QtiFeedback extends LitElement {
  @property({ type: String, attribute: 'show-hide' })
  protected showHide: string;

  @property({ type: String, attribute: 'outcome-identifier' })
  public outcomeIdentifier: string;

  @property({ type: String })
  protected identifier: string;

  @property({ type: String, attribute: false })
  public showStatus: string;

  @consume({ context: itemContext, subscribe: true })
  @state()
  private _context?: ItemContext;

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

    this.showFeedback(isFound);
  }

  private showFeedback(value: boolean) {
    this.showStatus = (value && this.showHide === 'show') || (!value && this.showHide === 'hide') ? 'on' : 'off';
  }
}
