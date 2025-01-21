import { property, state } from 'lit/decorators.js';
import { LitElement } from 'lit';

import type { IInteraction } from './interaction.interface';

export abstract class Interaction extends LitElement implements IInteraction {
  static formAssociated = true;

  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier;

  @property({ reflect: true, type: Boolean }) disabled = false;

  @property({ reflect: true, type: Boolean }) readonly = false;

  @state()
  protected _correctResponse: string | string[];
  protected _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  abstract validate(reportValidity?: boolean): boolean;

  public reportValidity(): boolean {
    return this._internals.reportValidity();
  }

  public reset(): void {
    this.value = '';
  }

  abstract get value(): string | string[] | null;
  abstract set value(val: string | string[] | null);

  public get correctResponse(): string | string[] {
    return this._correctResponse;
  }
  set correctResponse(value: string | string[]) {
    this._correctResponse = value;
  }

  public override connectedCallback() {
    super.connectedCallback();

    this.dispatchEvent(
      new CustomEvent('qti-register-interaction', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail: {
          interactionElement: this,
          responseIdentifier: this.responseIdentifier
        }
      })
    );
  }

  public saveResponse(value: string | string[]) {
    this.dispatchEvent(
      new CustomEvent('qti-interaction-response', {
        bubbles: true,
        composed: true,
        cancelable: false,
        detail: {
          responseIdentifier: this.responseIdentifier,
          response: Array.isArray(value) ? [...value] : value
        }
      })
    );
  }
}
