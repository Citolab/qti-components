import { property } from 'lit/decorators.js';
import { LitElement } from 'lit';
import { consume } from '@lit/context';

// import { configContext } from '../context/config.context';
// import { itemContext } from '../context/qti-assessment-item.context';
import { CorrectnessStates } from '../lib/correctness-states';
import { InteractionViewState } from '../controllers/interaction-review.controller';
import { configContext, type ConfigContext } from '../context/config.context';
import { itemContext } from '../context/qti-assessment-item.context';

import type { InteractionReviewController } from '../controllers/interaction-review.controller';
import type { ResponseVariable } from '../lib/variables';
import type { IInteraction } from '../lib/interaction.interface';
import type { ItemContext } from '../context/item.context';

export abstract class Interaction extends LitElement implements IInteraction {
  @consume({ context: itemContext, subscribe: true })
  private _context: ItemContext;

  @consume({ context: configContext, subscribe: true })
  protected configContext: ConfigContext;

  static formAssociated = true;
  protected _internals: ElementInternals;
  protected _correctResponseValue: string | string[] = '';
  protected reviewController?: InteractionReviewController;
  private _shouldRegisterInteraction = true;

  get internals(): ElementInternals {
    return this._internals;
  }

  abstract get response(): string | string[] | null;
  abstract set response(val: string | string[] | null);

  @property({ type: String })
  set value(val: string | null) {
    this.response = val ? JSON.parse(val) : null;
  }
  get value(): string | null {
    return JSON.stringify(this.response);
  }

  @property({ type: String, attribute: 'correct-response' })
  public set correctResponse(val: Readonly<string | string[]>) {
    console.log('Setting correct response:', val);
    this._correctResponseValue = val as string | string[];
  }
  public get correctResponse(): Readonly<string | string[]> {
    return this._correctResponseValue;
  }

  @property({ type: Boolean, attribute: 'correct-inline', reflect: true })
  public set _toggleCorrectResponse(show) {
    console.log('Setting correct response:', show);
    this.reviewController?.toggleCorrectResponse(show);
  }

  @property({ type: Boolean, attribute: 'correct-complete', reflect: true })
  public set _toggleCandidateCorrection(show) {
    console.log('Setting correct response:', show);
    this.reviewController?.toggleCandidateCorrection(show);
  }

  @property({ type: String, attribute: 'response-identifier' }) responseIdentifier: string;

  @property({ reflect: true, type: Boolean }) disabled = false;

  @property({ reflect: true, type: Boolean }) readonly = false;

  get correctnessState(): Readonly<CorrectnessStates | null> {
    const responseVariable = this.responseVariable;
    if (!responseVariable || responseVariable.correctResponse === null) return null;

    return responseVariable.correctResponse === responseVariable.value
      ? CorrectnessStates.Correct
      : CorrectnessStates.Incorrect;
  }

  get viewState(): InteractionViewState {
    return this.reviewController?.viewState ?? InteractionViewState.Default;
  }

  get isCorrectResponseVisible(): boolean {
    return this.reviewController?.isCorrectResponseVisible ?? false;
  }

  get isCandidateCorrectionVisible(): boolean {
    return this.reviewController?.isCandidateCorrectionVisible ?? false;
  }

  public getReviewConfigContext(): ConfigContext | undefined {
    return this.configContext;
  }

  get isInline(): boolean {
    return false;
  }

  get responseVariable(): ResponseVariable | undefined {
    const responseVariables = this._context.variables.filter(v => v.type === 'response') as ResponseVariable[];
    const responseIdentifier = this.getAttribute('response-identifier');
    return responseVariables.find(v => v.identifier === responseIdentifier);
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  public toggleCorrectResponse(show: boolean): void {
    this.reviewController?.toggleCorrectResponse(show);
  }

  public toggleCandidateCorrection(show: boolean): void {
    this.reviewController?.toggleCandidateCorrection(show);
  }

  abstract validate(): boolean;

  public reportValidity(): boolean {
    return this._internals.reportValidity();
  }

  public reset(): void {
    this.response = null;
  }

  public override connectedCallback(): void {
    super.connectedCallback();

    if (!this.shouldRegisterInteraction()) {
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

  protected shouldRegisterInteraction(): boolean {
    return this._shouldRegisterInteraction;
  }

  /**
   * Prevents the interaction from registering with its parent.
   * Used when cloning interactions for review-only presentation.
   */
  public disableInteractionRegistration(): void {
    this._shouldRegisterInteraction = false;
  }

  protected toggleInternalCorrectResponse(show: boolean): void {
    this.reviewController?.applyDefaultInternalCorrectResponse(show);
  }

  public invokeInternalCorrectResponseToggle(show: boolean): void {
    this.toggleInternalCorrectResponse(show);
  }
}
