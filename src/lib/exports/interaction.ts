import { property, state } from 'lit/decorators.js';
import { LitElement } from 'lit';
import { consume } from '@lit/context';

import { configContext } from './config.context.ts';

import type { ConfigContext } from './config.context.ts';
import type { ResponseVariable } from './variables';
import type { IInteraction } from './interaction.interface';

export abstract class Interaction extends LitElement implements IInteraction {

  @consume({ context: configContext, subscribe: true })
  private configContext: ConfigContext;

  static formAssociated = true;
  protected _internals: ElementInternals;

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

  @state()
  protected _isCorrect: boolean | null = null;

  get isCorrect(): Readonly<boolean | null> {
    return this._isCorrect;
  }

  set isCorrect(val: Readonly<boolean | null>) {
    this._isCorrect = val as boolean;
  }

  public toggleCorrectResponse(responseVariable: ResponseVariable, show: boolean) {
    const correctResponseMode = this?.configContext?.correctResponseMode || 'internal'

    if (correctResponseMode === 'full') {
      this.toggleFullCorrectResponse(responseVariable, show);
    } else {
      this.toggleInternalCorrectResponse(responseVariable, show);
    }
  }

  protected async toggleFullCorrectResponse(responseVariable: ResponseVariable, show: boolean) {
    const nextSibling = this.nextElementSibling;
    const nextSiblingIsFullCorrectResponse = nextSibling?.classList.contains('full-correct-response');

    const isCorrect = responseVariable.correctResponse === responseVariable.value;

    if (!show || isCorrect) { // Don't show with the correct answer responded
      if (!nextSiblingIsFullCorrectResponse) {
        return;
      }
      // Remove cloned interaction
      this.parentElement?.removeChild(nextSibling);
    }

    if (nextSiblingIsFullCorrectResponse) {
      return; // Already exists
    }

    if (isCorrect) {
      return;
    }

    // Add a clone of interaction with the correct response
    const clone = this.cloneNode(true) as Interaction;
    clone.isFullCorrectResponse = true;
    clone.disabled = true;

    const containerDiv = document.createElement('div');
    containerDiv.classList.add('full-correct-response');
    containerDiv.role = 'full-correct-response';
    containerDiv.appendChild(clone);
    clone.setAttribute('response-identifier', this.responseIdentifier + '_cr');

    this.parentElement?.insertBefore(containerDiv, this.nextElementSibling);
    await clone.updateComplete;

    clone.response = Array.isArray(responseVariable.correctResponse)
      ? [...responseVariable.correctResponse] as string[]
      : responseVariable.correctResponse as string;

    const responseVariableClone = { ...responseVariable };
    responseVariableClone.value = responseVariable.correctResponse;
    clone.toggleCandidateCorrection(responseVariableClone, true);
  }

  protected toggleInternalCorrectResponse(responseVariable: ResponseVariable, show: boolean) {
    this.correctResponse = show
      ? responseVariable?.correctResponse
      : responseVariable?.cardinality === 'single'
        ? ''
        : [];
  }

  public toggleCandidateCorrection(responseVariable: ResponseVariable, show: boolean) {
    this.isCorrect = show
      ? responseVariable.correctResponse === responseVariable.value
      : null;

    this._internals.states.delete('candidate-correct');
    this._internals.states.delete('candidate-incorrect');

    if (this.isCorrect === true) {
      this._internals.states.add('candidate-correct');
    }
    if (this.isCorrect === false) {
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
