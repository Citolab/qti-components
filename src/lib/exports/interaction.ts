import { property, state } from 'lit/decorators.js';
import { LitElement } from 'lit';

import type { ResponseVariable } from './variables';
import type { IInteraction } from './interaction.interface';

export abstract class Interaction extends LitElement implements IInteraction {
  static formAssociated = true;
  protected _internals: ElementInternals;

  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier;

  @property({ reflect: true, type: Boolean }) disabled = false;

  @property({ reflect: true, type: Boolean }) readonly = false;

  /* PK: Correct response */
  @state()
  protected _correctResponse: string | string[];

  get correctResponse(): Readonly<string | string[]> {
    return this._correctResponse;
  }

  set correctResponse(val: Readonly<string | string[]>) {
    this._correctResponse = val as string | string[];
  }

  public toggleCorrectResponse(responseVariable: ResponseVariable, show: boolean) {
    this.correctResponse = show
      ? responseVariable?.correctResponse
      : responseVariable.cardinality === 'single'
        ? ''
        : [];
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  abstract validate(): boolean;

  get value(): string | null {
    return JSON.stringify(this.response);
  }

  set value(val: string | null) {
    this.response = val ? JSON.parse(val) : null;
  }

  abstract get response(): string | string[] | null;
  abstract set response(val: string | string[] | null);

  public reportValidity(): boolean {
    return this._internals.reportValidity();
  }

  public reset(): void {
    this.response = null;
  }

  // attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
  //   super.attributeChangedCallback(name, _old, value);
  //   // changing attributes in lit is not a thing, they are defined in the QTI XML and will never change
  //   // except in storybook where we can change the value of the attribute
  //   // this can make the internal state out of sync with the attribute
  //   // so we reset the value to null to force the internal state to be reset
  //   const attributeNamesToExclude = ['style', 'class'];
  //   if (!attributeNamesToExclude.includes(name)) {
  //     this.reset();
  //   }
  // }

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
