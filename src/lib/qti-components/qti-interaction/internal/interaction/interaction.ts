import { property, state } from 'lit/decorators.js';
import { LitElement } from 'lit';
import { IInteraction } from './interaction.interface';

export abstract class Interaction extends LitElement implements IInteraction {
  static formAssociated = true; // Enable form association

  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier = '';
  /** disabled should be exposed to the attributes and accessible as property */
  @property({ reflect: true, type: Boolean }) disabled = false;

  /** readonly should be exposed to the attributes and accessible as property */
  @property({ reflect: true, type: Boolean }) readonly = false;

  @state()
  protected _correctResponse: string | string[] = '';
  protected _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  abstract validate(): boolean;

  public reportValidity(): boolean {
    return this._internals.reportValidity();
  }

  public reset(): void {
    this.value = '';
  }

  abstract get value(): string | string[];
  abstract set value(val: string | string[]);

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
        cancelable: false,
        composed: true
      })
    );
  }

  public saveResponse(value: string | string[]) {
    this.dispatchEvent(
      new CustomEvent('qti-interaction-response', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          responseIdentifier: this.responseIdentifier,
          response: Array.isArray(value) ? [...value] : value
        }
      })
    );
  }
}
