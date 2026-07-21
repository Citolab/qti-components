import { state } from 'lit/decorators.js';

import { CorrectResponseMixin, Correctness, type CorrectResponseInterface } from './correct-response.mixin';

import type { Interaction } from '@qti-components/base';

type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

export const CandidateCorrectionMixin = <T extends AbstractConstructor<Interaction>>(superClass: T) => {
  abstract class CandidateCorrectionMixinClass extends CorrectResponseMixin(superClass) {
    @state() private _candidateCorrection: 'correct' | 'incorrect' | 'partially-correct' | null = null;

    public override get correctionPart(): string {
      return this._candidateCorrection ? `correction correction-${this._candidateCorrection}` : 'correction';
    }

    public override toggleCandidateCorrection(show: boolean): void {
      if (this.showCandidateCorrection !== show) {
        this.showCandidateCorrection = show;
      }

      super.toggleCandidateCorrection(show);

      const internals = (this as unknown as { _internals: ElementInternals })._internals;

      internals.states.delete('candidate-correct');
      internals.states.delete('candidate-partially-correct');
      internals.states.delete('candidate-incorrect');

      let verdict: 'correct' | 'incorrect' | 'partially-correct' | null = null;

      if (show) {
        if (this.correctness === Correctness.Correct) {
          internals.states.add('candidate-correct');
          verdict = 'correct';
        }
        if (this.correctness === Correctness.PartiallyCorrect) {
          internals.states.add('candidate-partially-correct');
          verdict = 'partially-correct';
        }
        if (this.correctness === Correctness.Incorrect) {
          internals.states.add('candidate-incorrect');
          verdict = 'incorrect';
        }
      }

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
