import { property, state } from 'lit/decorators.js';
import { LitElement } from 'lit';
import { consume } from '@lit/context';

import { configContext } from './config.context.ts';
import { itemContext } from './qti-assessment-item.context.ts';

import type { ConfigContext } from './config.context.ts';
import type { ResponseVariable } from './variables';
import type { IInteraction } from './interaction.interface';
import type { ItemContext } from './item.context.ts';

export enum Correctness {
  Correct = 'correct',
  PartiallyCorrect = 'partially-correct',
  Incorrect = 'incorrect',
}

export abstract class Interaction extends LitElement implements IInteraction {
  @consume({ context: itemContext, subscribe: true })
  private _context: ItemContext;

  @consume({ context: configContext, subscribe: true })
  protected configContext: ConfigContext;

  static formAssociated = true;
  protected _internals: ElementInternals;

  get internals(): ElementInternals {
    return this._internals;
  }

  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier;

  @property({ reflect: true, type: Boolean }) disabled = false;

  @property({ reflect: true, type: Boolean }) readonly = false;

  @state()
  protected _isFullCorrectResponse: boolean;

  get isFullCorrectResponse(): Readonly<boolean> {
    return this._isFullCorrectResponse;
  }

  set isFullCorrectResponse(val: Readonly<boolean>) {
    this._isFullCorrectResponse = val as boolean;
    if (val) {
      this.disabled = true;
    }
  }

  /* PK: Correct response */
  @state()
  protected _correctResponse: string | string[];

  get correctResponse(): Readonly<string | string[]> {
    return this._correctResponse;
  }

  set correctResponse(val: Readonly<string | string[]>) {
    this._correctResponse = val as string | string[];
  }

  get correctness(): Readonly<Correctness | null> {
    const responseVariable = this.responseVariable;
    return responseVariable.correctResponse === responseVariable.value ? Correctness.Correct : Correctness.Incorrect;
  }

  get isInline(): boolean {
    return false;
  }

  get responseVariable(): ResponseVariable | undefined {
    // Get all response variables
    const responseVariables = this._context.variables.filter(v => v.type === 'response') as ResponseVariable[];

    // Get the response identifier for this interaction
    const responseIdentifier = this.getAttribute('response-identifier');

    // Return the matching response variable for this interaction
    return responseVariables.find(v => v.identifier === responseIdentifier);
  }

  public toggleCorrectResponse(show: boolean) {
    const correctResponseMode = this?.configContext?.correctResponseMode || 'internal';

    if (correctResponseMode === 'full') {
      this.toggleFullCorrectResponse(show);
    } else {
      this.toggleInternalCorrectResponse(show);
    }
  }

  protected async toggleFullCorrectResponse(show: boolean) {
    const nextSibling = this.nextSibling;
    const nextSiblingIsFullCorrectResponse =
      nextSibling instanceof HTMLDivElement && nextSibling?.classList.contains('full-correct-response');
    const responseVariable = this.responseVariable;

    if (!responseVariable) {
      return;
    }

    if (!show || this.correctness === Correctness.Correct) {
      // Don't show with the correct answer responded
      if (!nextSiblingIsFullCorrectResponse) {
        return;
      }
      // Remove cloned interaction
      this.parentElement?.removeChild(nextSibling);
    }

    if (nextSiblingIsFullCorrectResponse) {
      return; // Already exists
    }

    if (this.correctness === Correctness.Correct) {
      return;
    }

    // Add a clone of interaction with the correct response
    const clone = this.cloneNode(true) as Interaction;

    const containerDiv = document.createElement('div');
    containerDiv.classList.add('full-correct-response');
    if (this.isInline) {
      containerDiv.classList.add('full-correct-response-inline');
    } else {
      containerDiv.classList.add('full-correct-response-block');
    }
    containerDiv.role = 'full-correct-response';
    containerDiv.appendChild(clone);

    clone.isFullCorrectResponse = true;

    this.parentElement?.insertBefore(containerDiv, this.nextSibling);
    await clone.updateComplete;

    clone.response = Array.isArray(responseVariable.correctResponse)
      ? [...responseVariable.correctResponse] as string[]
      : responseVariable.correctResponse as string;
  }

  protected toggleInternalCorrectResponse(show: boolean) {
    const responseVariable = this.responseVariable;

    this.correctResponse = show
      ? responseVariable?.correctResponse
      : responseVariable?.cardinality === 'single'
        ? ''
        : [];
  }

  public toggleCandidateCorrection(show: boolean) {
    const responseVariable = this.responseVariable;
    if (!responseVariable) return;

    this._internals.states.delete('candidate-correct');
    this._internals.states.delete('candidate-partially-correct');
    this._internals.states.delete('candidate-incorrect');

    if (!show) {
      return;
    }

    if (this.correctness === Correctness.Correct) {
      this._internals.states.add('candidate-correct');
    }
    if (this.correctness === Correctness.PartiallyCorrect) {
      this._internals.states.add('candidate-partially-correct');
    }
    if (this.correctness === Correctness.Incorrect) {
      this._internals.states.add('candidate-incorrect');
    }
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

    if (this.isFullCorrectResponse) {
      return;
    }

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
