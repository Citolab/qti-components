import { property } from 'lit/decorators.js';
import { LitElement } from 'lit';

export abstract class Interaction extends LitElement {
  @property({ attribute: 'response-identifier' }) responseIdentifier: string = '';

  /** disabled should be exposed to the attributes and accessible as property */
  @property({ reflect: true, type: Boolean }) disabled = false;

  /** readonly should be exposed to the attributes and accessible as property */
  @property({ reflect: true, type: Boolean }) readonly = false;

  abstract reset(): void;
  abstract validate(): boolean;
  abstract set response(val: string | string[]);

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
          response: value
        }
      })
    );
  }
}
