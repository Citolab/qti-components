import { CorrectnessStates } from '../lib/correctness-states';

import type { ConfigContext } from '../context/config.context';
import type { ResponseVariable } from '../lib/variables';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

export enum InteractionViewState {
  Default = 'default',
  CorrectResponse = 'correct-response',
  CandidateCorrection = 'candidate-correction'
}

export interface InteractionReviewState {
  viewState: InteractionViewState;
  correctResponseVisible: boolean;
  candidateCorrectionVisible: boolean;
  correctnessState: CorrectnessStates | null;
}

export interface InteractionReviewControllerHost extends ReactiveControllerHost, HTMLElement {
  getReviewConfigContext(): ConfigContext | undefined;
  readonly correctnessState: CorrectnessStates | null;
  readonly responseVariable?: ResponseVariable;
  response: string | string[] | null;
  correctResponse: Readonly<string | string[]>;
  readonly internals: ElementInternals;
  readonly isInline: boolean;
  disabled: boolean;
  readonly responseIdentifier: string;
  invokeInternalCorrectResponseToggle(show: boolean): void;
  disableInteractionRegistration(): void;
}

type ResponseLike = string | string[] | readonly string[] | null | undefined;

export class InteractionReviewController implements ReactiveController {
  private _viewState: InteractionViewState = InteractionViewState.Default;
  private _isCorrectResponseVisible = false;
  private _isCandidateCorrectionVisible = false;

  constructor(private readonly host: InteractionReviewControllerHost) {
    host.addController(this);
  }

  hostConnected(): void {}
  hostDisconnected(): void {}

  public get viewState(): InteractionViewState {
    return this._viewState;
  }

  public get isCorrectResponseVisible(): boolean {
    return this._isCorrectResponseVisible;
  }

  public get isCandidateCorrectionVisible(): boolean {
    return this._isCandidateCorrectionVisible;
  }

  public toggleCorrectResponse(show: boolean): void {
    this.setCorrectResponseVisibility(show);

    const correctResponseMode = this.host.getReviewConfigContext()?.correctResponseMode || 'internal';
    if (correctResponseMode === 'full') {
      void this.toggleFullCorrectResponse(show);
    } else {
      this.host.invokeInternalCorrectResponseToggle(show);
    }
  }

  public async toggleFullCorrectResponse(show: boolean): Promise<void> {
    const nextSibling = this.host.nextSibling;
    const nextSiblingIsFullCorrectResponse =
      nextSibling instanceof HTMLDivElement && nextSibling.classList.contains('full-correct-response');
    const responseVariable = this.host.responseVariable;

    if (!responseVariable) {
      return;
    }

    const configContext = this.host.getReviewConfigContext();
    const showFullCorrectResponse =
      show &&
      (configContext?.fullCorrectResponseOnlyWhenIncorrect === false ||
        this.host.correctnessState !== CorrectnessStates.Correct);

    if (!showFullCorrectResponse) {
      if (nextSiblingIsFullCorrectResponse && nextSibling) {
        this.host.parentElement?.removeChild(nextSibling);
      }
      return;
    }

    if (nextSiblingIsFullCorrectResponse) {
      return;
    }

    const clone = this.host.cloneNode(true) as InteractionReviewControllerHost & HTMLElement;

    clone.disableInteractionRegistration();
    clone.disabled = true;
    clone.setAttribute('response-identifier', `${this.host.responseIdentifier}_cr`);
    clone.setAttribute('data-full-correct-response', 'true');

    const containerDiv = document.createElement('div');
    containerDiv.classList.add('full-correct-response');
    if (this.host.isInline) {
      containerDiv.classList.add('full-correct-response-inline');
    } else {
      containerDiv.classList.add('full-correct-response-block');
    }
    containerDiv.role = 'full-correct-response';
    containerDiv.appendChild(clone);

    this.host.parentElement?.insertBefore(containerDiv, this.host.nextSibling);
    await (clone as unknown as { updateComplete?: Promise<unknown> }).updateComplete;

    clone.response = Array.isArray(responseVariable.correctResponse)
      ? ([...responseVariable.correctResponse] as string[])
      : (responseVariable.correctResponse as string);

    clone.setAttribute('view-state', InteractionViewState.CorrectResponse);
  }

  public toggleCandidateCorrection(show: boolean): void {
    this.setCandidateCorrectionVisibility(show);

    const responseVariable = this.host.responseVariable;
    if (!responseVariable) return;

    this.host.internals.states.delete('candidate-correct');
    this.host.internals.states.delete('candidate-partially-correct');
    this.host.internals.states.delete('candidate-incorrect');

    if (!show) {
      return;
    }

    if (this.host.correctnessState === CorrectnessStates.Correct) {
      this.host.internals.states.add('candidate-correct');
    }
    if (this.host.correctnessState === CorrectnessStates.PartiallyCorrect) {
      this.host.internals.states.add('candidate-partially-correct');
    }
    if (this.host.correctnessState === CorrectnessStates.Incorrect) {
      this.host.internals.states.add('candidate-incorrect');
    }
  }

  public applyDefaultInternalCorrectResponse(show: boolean): void {
    const responseVariable = this.host.responseVariable;

    if (show && responseVariable?.correctResponse !== undefined) {
      this.host.correctResponse = Array.isArray(responseVariable.correctResponse)
        ? ([...responseVariable.correctResponse] as string[])
        : (responseVariable.correctResponse as string);
      return;
    }

    const fallback = responseVariable?.cardinality === 'single' ? '' : [];
    this.host.correctResponse = fallback as string | string[];
  }

  public getState(): InteractionReviewState {
    return {
      viewState: this._viewState,
      correctResponseVisible: this._isCorrectResponseVisible,
      candidateCorrectionVisible: this._isCandidateCorrectionVisible,
      correctnessState: this.host.correctnessState
    };
  }

  public normalizeResponse(value: ResponseLike): string[] {
    if (!value) {
      return [];
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map(entry => entry.trim())
        .filter(Boolean);
    }

    if (Array.isArray(value)) {
      return value.map(entry => entry.trim()).filter(Boolean);
    }

    return [];
  }

  public isCorrectAssociation(pair: string, correctPairs: Set<string>): boolean {
    return correctPairs.has(pair);
  }

  public getCorrectnessClass(correctnessState: CorrectnessStates | null): string | null {
    if (!correctnessState) return null;
    return `candidate-${correctnessState}`;
  }

  private setCorrectResponseVisibility(show: boolean): void {
    this._isCorrectResponseVisible = show;
    this.updateViewStateFromFlags();
  }

  private setCandidateCorrectionVisibility(show: boolean): void {
    this._isCandidateCorrectionVisible = show;
    this.updateViewStateFromFlags();
  }

  private updateViewStateFromFlags(): void {
    if (this._isCandidateCorrectionVisible) {
      this.setViewState(InteractionViewState.CandidateCorrection);
      return;
    }

    if (this._isCorrectResponseVisible) {
      this.setViewState(InteractionViewState.CorrectResponse);
      return;
    }

    this.setViewState(InteractionViewState.Default);
  }

  private setViewState(nextState: InteractionViewState): void {
    if (this._viewState === nextState) {
      return;
    }

    this._viewState = nextState;
    this.host.setAttribute('view-state', nextState);

    this.host.dispatchEvent(
      new CustomEvent('qti-view-state-changed', {
        bubbles: true,
        composed: true,
        detail: { viewState: nextState }
      })
    );
  }
}
