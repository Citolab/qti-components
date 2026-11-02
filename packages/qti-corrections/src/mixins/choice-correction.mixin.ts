import { setState } from '@qti-components/base';

import { CandidateCorrectionMixin } from './candidate-correction.mixin';

import type { Interaction } from '@qti-components/base';
import type { CorrectResponseInterface } from './correct-response.mixin';

type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

type CorrectableChoice = HTMLElement & {
  identifier: string;
  internals: ElementInternals;
  candidateCorrection: 'correct' | 'incorrect' | 'partially-correct' | null;
};

type ChoicesCorrectionBase = Interaction & {
  readonly response: string | string[] | null;
  readonly internals: ElementInternals;
};

/**
 * Adds per-choice candidate marking to interactions built on `ChoicesMixin`.
 *
 * Each choice gets its own states (CONTRACT.md §3): the verdict through its `candidateCorrection`
 * (`ActiveElementCorrectionMixin`), and `answer-key` when it is part of the correct response (alias
 * `correct-response`, one major). A choice outside the key gets nothing; the old `incorrect-response`
 * was never styled and is gone.
 */
export const ChoiceCorrectionMixin = <T extends AbstractConstructor<ChoicesCorrectionBase>>(superClass: T) => {
  abstract class ChoiceCorrectionMixinClass extends CandidateCorrectionMixin(superClass) {
    declare protected _choiceElements: CorrectableChoice[];

    public override toggleInternalCorrectResponse(show: boolean): void {
      super.toggleInternalCorrectResponse(show);

      const correctResponse = this.correctResponse;
      const correctResponses = correctResponse
        ? Array.isArray(correctResponse)
          ? correctResponse
          : [correctResponse]
        : [];

      for (const choice of this._choiceElements) {
        const inKey = show && correctResponses.includes(choice.identifier);
        setState(choice.internals.states, 'answer-key', inKey, ['correct-response']);
      }
    }

    public override toggleCandidateCorrection(show: boolean): void {
      super.toggleCandidateCorrection(show);

      for (const choice of this._choiceElements) {
        choice.candidateCorrection = null;
      }

      if (!show || !this.correctResponse) {
        return;
      }

      const correctResponses = Array.isArray(this.correctResponse) ? this.correctResponse : [this.correctResponse];
      const candidateResponses = Array.isArray(this.response) ? this.response : this.response ? [this.response] : [];

      for (const choice of this._choiceElements) {
        if (!candidateResponses.includes(choice.identifier)) {
          continue;
        }
        choice.candidateCorrection = correctResponses.includes(choice.identifier) ? 'correct' : 'incorrect';
      }
    }
  }

  return ChoiceCorrectionMixinClass as unknown as AbstractConstructor<CorrectResponseInterface> & T;
};
