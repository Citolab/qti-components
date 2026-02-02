import { property, state } from 'lit/decorators.js';
import { LitElement } from 'lit';
import { consume } from '@lit/context';

import { watch } from '@qti-components/utilities';

import { configContext } from '../context/config.context';
import { itemContext } from '../context/qti-assessment-item.context';

import type { ConfigContext } from '../context/config.context';
import type { ResponseVariable } from '../lib/variables';
import type { IInteraction } from '../lib/interaction.interface';
import type { ItemContext } from '../context/item.context';

export enum Correctness {
  Correct = 'correct',
  PartiallyCorrect = 'partially-correct',
  Incorrect = 'incorrect'
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

  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string;

  @property({ reflect: true, type: Boolean }) disabled = false;

  @property({ reflect: true, type: Boolean }) readonly = false;

  @property({ type: String }) name;

  // ═══════════════════════════════════════════════════════════════════════════════
  // CORRECT RESPONSE - Standalone mode attributes
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * The correct response for this interaction. Can be set as a comma-separated
   * string via attribute or as string/string[] via property.
   *
   * @example
   * ```html
   * <qti-choice-interaction correct-response="A,B">
   * ```
   */
  @property({ type: String, attribute: 'correct-response', reflect: true })
  set correctResponseAttr(val: string | null) {
    if (val === null) {
      this._correctResponse = null;
    } else if (val.includes(',')) {
      this._correctResponse = val.split(',').map(v => v.trim());
    } else {
      this._correctResponse = val;
    }
  }

  get correctResponseAttr(): string | null {
    if (this._correctResponse === null || this._correctResponse === undefined) {
      return null;
    }
    return Array.isArray(this._correctResponse) ? this._correctResponse.join(',') : this._correctResponse;
  }

  /**
   * Shows which choices are correct with inline indicators.
   * Adds `correct-response` / `incorrect-response` states to choices.
   */
  @property({ type: Boolean, attribute: 'show-correct-response', reflect: true })
  showCorrectResponse = false;

  @watch('showCorrectResponse', { waitUntilFirstUpdate: true })
  protected _handleShowCorrectResponseChange = (_: boolean, show: boolean) => {
    this.toggleInternalCorrectResponse(show);
  };

  /**
   * Shows a cloned interaction with the correct answers filled in.
   * Creates a disabled copy positioned after this interaction.
   */
  @property({ type: Boolean, attribute: 'show-full-correct-response', reflect: true })
  showFullCorrectResponse = false;

  @watch('showFullCorrectResponse', { waitUntilFirstUpdate: true })
  protected _handleShowFullCorrectResponseChange = (_: boolean, show: boolean) => {
    this.toggleFullCorrectResponse(show);
  };

  /**
   * Shows feedback on candidate's selections compared to correct response.
   * Adds `candidate-correct` / `candidate-incorrect` states to choices.
   */
  @property({ type: Boolean, attribute: 'show-candidate-correction', reflect: true })
  showCandidateCorrection = false;

  @watch('showCandidateCorrection', { waitUntilFirstUpdate: true })
  protected _handleShowCandidateCorrectionChange = (_: boolean, show: boolean) => {
    this.toggleCandidateCorrection(show);
  };

  // ═══════════════════════════════════════════════════════════════════════════════

  @state()
  protected _isFullCorrectResponse: boolean;

  get isFullCorrectResponse(): Readonly<boolean> {
    return this._isFullCorrectResponse;
  }

  set isFullCorrectResponse(val: Readonly<boolean>) {
    this._isFullCorrectResponse = val as boolean;
    if (val) {
      this.disabled = true;
      this.setAttribute('inert', '');
      this.setAttribute('response-identifier', this.responseIdentifier + '_cr');
    }
  }

  /* PK: Correct response */
  @state()
  protected _correctResponse: string | string[] | null = null;

  /**
   * Get/set correct response programmatically.
   * This property syncs with the `correct-response` attribute.
   */
  get correctResponse(): Readonly<string | string[] | null> {
    // In standalone mode, use the local _correctResponse
    // In item context mode, prefer responseVariable.correctResponse
    const responseVariable = this.responseVariable;
    if (responseVariable?.correctResponse) {
      return responseVariable.correctResponse;
    }
    return this._correctResponse;
  }

  set correctResponse(val: Readonly<string | string[] | null>) {
    const oldVal = this._correctResponse;
    this._correctResponse = val as string | string[] | null;
    // Sync to attribute
    if (val === null || val === undefined) {
      this.removeAttribute('correct-response');
    } else {
      this.setAttribute('correct-response', Array.isArray(val) ? val.join(',') : (val as string));
    }
    this.requestUpdate('_correctResponse', oldVal);
  }

  /**
   * Returns the correctness of the current response compared to correct response.
   * Works in both standalone mode (using `correct-response` attribute) and
   * item context mode (using responseVariable).
   */
  get correctness(): Readonly<Correctness | null> {
    const correctResponse = this.correctResponse;
    if (!correctResponse) return null;

    const currentResponse = this.response;
    // No response yet (null, undefined, empty string, or empty array)
    if (
      currentResponse === null ||
      currentResponse === undefined ||
      currentResponse === '' ||
      (Array.isArray(currentResponse) && currentResponse.length === 0)
    ) {
      return null;
    }

    // Normalize both to arrays for comparison
    const correctArr = Array.isArray(correctResponse) ? correctResponse : [correctResponse];
    const responseArr = Array.isArray(currentResponse) ? currentResponse : [currentResponse];

    // Filter out empty strings
    const filteredResponseArr = responseArr.filter(r => r !== '');
    if (filteredResponseArr.length === 0) return null;

    // Check for partial correctness - some correct selections but not all, or extra incorrect selections
    const correctCount = filteredResponseArr.filter(r => correctArr.includes(r)).length;
    const incorrectCount = filteredResponseArr.filter(r => !correctArr.includes(r)).length;

    // All responses are correct and we have all correct answers
    if (
      correctCount === correctArr.length &&
      incorrectCount === 0 &&
      filteredResponseArr.length === correctArr.length
    ) {
      return Correctness.Correct;
    }

    // Some correct responses but not complete or has incorrect responses
    if (correctCount > 0 && (correctCount < correctArr.length || incorrectCount > 0)) {
      return Correctness.PartiallyCorrect;
    }

    return Correctness.Incorrect;
  }

  get isInline(): boolean {
    return false;
  }

  get responseVariable(): ResponseVariable | undefined {
    // In standalone mode (no item context), return undefined
    if (!this._context?.variables) {
      return undefined;
    }

    // Get all response variables
    const responseVariables = this._context.variables.filter(v => v.type === 'response') as ResponseVariable[];

    // Get the response identifier for this interaction
    const responseIdentifier = this.getAttribute('response-identifier');

    // Return the matching response variable for this interaction
    return responseVariables.find(v => v.identifier === responseIdentifier);
  }

  public toggleCorrectResponse(show: boolean): void {
    const correctResponseMode = this?.configContext?.correctResponseMode || 'internal';

    if (correctResponseMode === 'full') {
      this.toggleFullCorrectResponse(show);
    } else {
      this.toggleInternalCorrectResponse(show);
    }
  }

  protected async toggleFullCorrectResponse(show: boolean): Promise<void> {
    const nextSibling = this.nextSibling;
    const nextSiblingIsFullCorrectResponse =
      nextSibling instanceof HTMLDivElement && nextSibling?.classList.contains('full-correct-response');

    // Get correct response from either responseVariable (item context) or local property (standalone)
    const correctResponse = this.correctResponse;

    if (!correctResponse) {
      return;
    }

    const showFullCorrectResponse =
      show &&
      (this?.configContext?.fullCorrectResponseOnlyWhenIncorrect === false || this.correctness !== Correctness.Correct);

    if (!showFullCorrectResponse) {
      if (!nextSiblingIsFullCorrectResponse) {
        return;
      }
      // Remove cloned interaction
      this.parentElement?.removeChild(nextSibling);
      return;
    }

    if (nextSiblingIsFullCorrectResponse) {
      return; // Already exists
    }

    // Add a clone of interaction with the correct response
    const clone = this.cloneNode(true) as Interaction;

    // Remove attributes that could cause issues on the clone
    clone.removeAttribute('show-full-correct-response');
    clone.removeAttribute('show-correct-response');
    clone.removeAttribute('show-candidate-correction');

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

    clone.response = Array.isArray(correctResponse) ? ([...correctResponse] as string[]) : (correctResponse as string);
  }

  protected toggleInternalCorrectResponse(show: boolean): void {
    // This method is meant to be overridden by mixins like ChoicesMixin
    // In the base class, we just update internal state for CSS states
    this._internals.states.delete('show-correct-response');
    if (show && this.correctResponse) {
      this._internals.states.add('show-correct-response');
    }
  }

  public toggleCandidateCorrection(show: boolean): void {
    this._internals.states.delete('candidate-correct');
    this._internals.states.delete('candidate-partially-correct');
    this._internals.states.delete('candidate-incorrect');

    if (!show) {
      return;
    }

    // correctness getter now works in both standalone and item context modes
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

  public override connectedCallback(): void {
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

  protected override firstUpdated(): void {
    // Skip for full correct response clones to avoid infinite loops
    if (this.isFullCorrectResponse) {
      return;
    }

    // Apply initial correct response display states after first render
    if (this.showCorrectResponse) {
      this.toggleInternalCorrectResponse(true);
    }
    if (this.showFullCorrectResponse) {
      this.toggleFullCorrectResponse(true);
    }
    if (this.showCandidateCorrection) {
      this.toggleCandidateCorrection(true);
    }
  }

  public saveResponse(value: string | string[]): void {
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
