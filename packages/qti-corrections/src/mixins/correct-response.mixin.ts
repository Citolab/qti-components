import { property, state } from 'lit/decorators.js';

import { watch } from '@qti-components/utilities';
import { responseAttributeConverter, type Interaction, type ResponseValue } from '@qti-components/base';

import type { CorrectionConfig } from '../context/correction-config';

type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

export enum Correctness {
  Correct = 'correct',
  PartiallyCorrect = 'partially-correct',
  Incorrect = 'incorrect'
}

/**
 * Adds correct-response and full-correct-response behaviour
 * on top of any `Interaction` subclass.
 *
 * Usage:
 * ```ts
 * export abstract class CorrectableInteraction extends CorrectResponseMixin(Interaction) {}
 * ```
 *
 * Interactions that genuinely have no correct-response concept
 * (extended-text, upload, media) should extend `Interaction` directly
 * and omit this mixin.
 */
export const CorrectResponseMixin = <T extends AbstractConstructor<Interaction>>(superClass: T) => {
  abstract class CorrectResponseMixinClass extends superClass {
    // ─── Correct-response attribute ──────────────────────────────────────────

    /**
     * The correct response for this interaction. Can be set as a comma-separated
     * string via attribute or as string/string[] via property.
     *
     * @example
     * ```html
     * <qti-choice-interaction correct-response="A,B">
     * ```
     */
    @property({
      attribute: 'correct-response',
      reflect: true,
      converter: responseAttributeConverter({ emptyAs: null })
    })
    set correctResponseAttr(val: ResponseValue) {
      this._correctResponse = val;
    }

    get correctResponseAttr(): ResponseValue {
      return this._correctResponse;
    }

    // ─── Show-correct-response ────────────────────────────────────────────────

    @property({ type: Boolean, attribute: 'show-correct-response', reflect: true })
    showCorrectResponse = false;

    @watch('showCorrectResponse', { waitUntilFirstUpdate: true })
    protected _handleShowCorrectResponseChange = (_: boolean, show: boolean) => {
      this.toggleInternalCorrectResponse(show);
    };

    // ─── Show-full-correct-response ───────────────────────────────────────────

    @property({ type: Boolean, attribute: 'show-full-correct-response', reflect: true })
    showFullCorrectResponse = false;

    @watch('showFullCorrectResponse', { waitUntilFirstUpdate: true })
    protected _handleShowFullCorrectResponseChange = (_: boolean, show: boolean) => {
      this.toggleFullCorrectResponse(show);
    };

    // ─── Show-candidate-correction ────────────────────────────────────────────

    @property({ type: Boolean, attribute: 'show-candidate-correction', reflect: true })
    showCandidateCorrection = false;

    @watch('showCandidateCorrection', { waitUntilFirstUpdate: true })
    protected _handleShowCandidateCorrectionChange = (_: boolean, show: boolean) => {
      this.toggleCandidateCorrection(show);
    };

    // ─── isFullCorrectResponse ────────────────────────────────────────────────

    @state()
    protected _isFullCorrectResponse: boolean;

    get isFullCorrectResponse(): boolean {
      return this._isFullCorrectResponse;
    }

    protected override get registersWithItem(): boolean {
      return !this.isFullCorrectResponse && super.registersWithItem;
    }

    set isFullCorrectResponse(val: boolean) {
      this._isFullCorrectResponse = val;
      if (val) {
        // `inert` already makes the answer-key clone non-interactive. Do NOT also set `disabled`:
        // it would mark every choice `:state(disabled)`, which the theme dims (opacity), fading the
        // answer key that is meant to be crisp. inert is enough.
        this.setAttribute('inert', '');
        this.setAttribute('response-identifier', this.responseIdentifier + '_cr');
        // An answer key shows the answer, not the means of giving one, so every drag-drop
        // interaction hides its chip bank here. Each one does that in its own stylesheet, keyed on
        // this attribute — hiding removes a box from the flow, which makes it layout, and layout is
        // not the theme's to declare (CONTRACT.md §7).
        //
        // The class the theme used instead, `.full-correct-response`, is on the wrapper *around*
        // this element, so only a document selector could see it. This attribute is on the clone
        // itself, which is what a shadow root can reach.
        this.setAttribute('answer-key', '');
      }
    }

    // ─── correctResponse property ─────────────────────────────────────────────

    @state()
    protected _correctResponse: string | string[] | null = null;

    get correctResponse(): Readonly<string | string[] | null> {
      const responseVariable = this.responseVariable;
      if (responseVariable?.correctResponse) {
        return responseVariable.correctResponse;
      }
      return this._correctResponse;
    }

    set correctResponse(val: Readonly<string | string[] | null>) {
      const oldVal = this._correctResponse;
      this._correctResponse = val as string | string[] | null;
      if (val === null || val === undefined) {
        this.removeAttribute('correct-response');
      } else {
        this.setAttribute('correct-response', Array.isArray(val) ? val.join(',') : (val as string));
      }
      this.requestUpdate('_correctResponse', oldVal);
    }

    // ─── correctness getter ───────────────────────────────────────────────────

    get correctness(): Readonly<Correctness | null> {
      const correctResponse = this.correctResponse;
      if (!correctResponse) return null;

      const currentResponse = this.response;
      if (
        currentResponse === null ||
        currentResponse === undefined ||
        currentResponse === '' ||
        (Array.isArray(currentResponse) && currentResponse.length === 0)
      ) {
        return null;
      }

      const correctArr = Array.isArray(correctResponse) ? correctResponse : [correctResponse];
      const responseArr = Array.isArray(currentResponse) ? currentResponse : [currentResponse];
      const filteredResponseArr = responseArr.filter(r => r !== '');
      if (filteredResponseArr.length === 0) return null;

      const correctCount = filteredResponseArr.filter(r => correctArr.includes(r)).length;
      const incorrectCount = filteredResponseArr.filter(r => !correctArr.includes(r)).length;

      if (
        correctCount === correctArr.length &&
        incorrectCount === 0 &&
        filteredResponseArr.length === correctArr.length
      ) {
        return Correctness.Correct;
      }

      if (correctCount > 0 && (correctCount < correctArr.length || incorrectCount > 0)) {
        return Correctness.PartiallyCorrect;
      }

      return Correctness.Incorrect;
    }

    // ─── correctionPart ───────────────────────────────────────────────────────

    public get correctionPart(): string {
      return 'correction';
    }

    // ─── toggle methods ───────────────────────────────────────────────────────

    public toggleCorrectResponse(show: boolean): void {
      const correctionConfig = this.configContext as CorrectionConfig | undefined;
      const correctResponseMode = correctionConfig?.correctResponseMode || 'internal';

      if (correctResponseMode === 'full') {
        this.toggleFullCorrectResponse(show);
      } else {
        this.toggleInternalCorrectResponse(show);
      }
    }

    /**
     * Whether the full correct response is withheld from a candidate who is already correct.
     *
     * Withheld by default, unless the item configures `fullCorrectResponseOnlyWhenIncorrect: false`
     * — the behaviour `show-full-correct-response` has always had, on the reasoning that a correct
     * answer already *is* the key.
     *
     * An interaction that routes its internal mode here overrides this to false: there, the caller
     * asked to show the correct response, and silently showing nothing is worse than showing the
     * candidate the answer they already gave.
     */
    protected get withholdsFullCorrectResponseWhenCorrect(): boolean {
      return (this.configContext as CorrectionConfig | undefined)?.fullCorrectResponseOnlyWhenIncorrect !== false;
    }

    protected async toggleFullCorrectResponse(show: boolean): Promise<void> {
      const nextSibling = this.nextSibling;
      const nextSiblingIsFullCorrectResponse =
        nextSibling instanceof HTMLDivElement && nextSibling?.classList.contains('full-correct-response');

      const correctResponse = this.correctResponse;

      if (!correctResponse) {
        return;
      }

      const showFullCorrectResponse =
        show && (!this.withholdsFullCorrectResponseWhenCorrect || this.correctness !== Correctness.Correct);

      if (!showFullCorrectResponse) {
        if (!nextSiblingIsFullCorrectResponse) {
          return;
        }
        this.parentElement?.removeChild(nextSibling);
        return;
      }

      if (nextSiblingIsFullCorrectResponse) {
        return;
      }

      const clone = this.cloneNode(true) as Interaction & CorrectResponseMixinClass;

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

      clone.response = Array.isArray(correctResponse)
        ? ([...correctResponse] as string[])
        : (correctResponse as string);
    }

    public toggleInternalCorrectResponse(show: boolean): void {
      this._internals.states.delete('show-correct-response');
      if (show && this.correctResponse) {
        this._internals.states.add('show-correct-response');
      }
    }

    public toggleCandidateCorrection(show: boolean): void {
      if (!show) {
        return;
      }
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    protected override firstUpdated(): void {
      super.firstUpdated();

      if (this.isFullCorrectResponse) {
        return;
      }

      if (this.showCorrectResponse) {
        this.toggleInternalCorrectResponse(true);
      }
      if (this.showFullCorrectResponse) {
        this.toggleFullCorrectResponse(true);
      }
    }
  }

  // Cast strips the anonymous class type so TypeScript can generate clean .d.ts
  // for any named class that extends this mixin (avoids TS4094).
  return CorrectResponseMixinClass as unknown as AbstractConstructor<CorrectResponseInterface> & T;
};

/** Public type surface exposed by `CorrectResponseMixin`. */
export interface CorrectResponseInterface {
  correctResponseAttr: ResponseValue;
  showCorrectResponse: boolean;
  showFullCorrectResponse: boolean;
  showCandidateCorrection: boolean;
  isFullCorrectResponse: boolean;
  correctResponse: Readonly<string | string[] | null>;
  readonly correctness: Readonly<Correctness | null>;
  readonly correctionPart: string;
  toggleCorrectResponse(show: boolean): void;
  toggleCandidateCorrection(show: boolean): void;
  /** Protected at runtime; exposed here so subclasses can call `super.toggleInternalCorrectResponse()`. */
  toggleInternalCorrectResponse(show: boolean): void;
  /** Protected at runtime. */
  toggleFullCorrectResponse(show: boolean): Promise<void>;
  /** Protected at runtime; declared here so a subclass can `override` it. */
  readonly withholdsFullCorrectResponseWhenCorrect: boolean;
}
