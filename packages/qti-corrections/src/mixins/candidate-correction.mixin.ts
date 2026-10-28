import { state } from 'lit/decorators.js';

import { applyVerdictStates, correctionPartFor, type CandidateCorrection } from './active-element-correction.mixin';
import { CorrectResponseMixin, Correctness, type CorrectResponseInterface } from './correct-response.mixin';

import type { Interaction } from '@qti-components/base';

type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

/**
 * Judges the interaction's own response against its correct response and exposes the verdict.
 *
 * @cssstate candidate-correct - The candidate's response is correct.
 * @cssstate candidate-incorrect - The candidate's response is incorrect.
 * @cssstate candidate-partial - The candidate's response is partially correct (alias `candidate-partially-correct`, one major).
 * @csspart correction - The verdict badge; its second token is the verdict state (`candidate-correct`, `candidate-incorrect`, `candidate-partial`), followed by the old `correction-<verdict>` token for one major.
 */
export const CandidateCorrectionMixin = <T extends AbstractConstructor<Interaction>>(superClass: T) => {
  abstract class CandidateCorrectionMixinClass extends CorrectResponseMixin(superClass) {
    @state() private _candidateCorrection: CandidateCorrection = null;

    public override get correctionPart(): string {
      return correctionPartFor(this._candidateCorrection);
    }

    public override toggleCandidateCorrection(show: boolean): void {
      if (this.showCandidateCorrection !== show) {
        this.showCandidateCorrection = show;
      }

      super.toggleCandidateCorrection(show);

      const internals = (this as unknown as { _internals: ElementInternals })._internals;

      let verdict: CandidateCorrection = null;

      if (show) {
        if (this.correctness === Correctness.Correct) verdict = 'correct';
        if (this.correctness === Correctness.PartiallyCorrect) verdict = 'partially-correct';
        if (this.correctness === Correctness.Incorrect) verdict = 'incorrect';
      }

      applyVerdictStates(internals.states, verdict);

      if (this._candidateCorrection !== verdict) {
        this._candidateCorrection = verdict;
      }
    }

    override connectedCallback(): void {
      super.connectedCallback?.();

      queueMicrotask(() => {
        if (!this.isConnected || this.isFullCorrectResponse) {
          return;
        }
        if (this.showCandidateCorrection) {
          this.toggleCandidateCorrection(true);
        }
      });
    }
  }

  return CandidateCorrectionMixinClass as unknown as AbstractConstructor<CorrectResponseInterface> & T;
};
