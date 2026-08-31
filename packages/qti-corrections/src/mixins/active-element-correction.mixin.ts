type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

export type CandidateCorrection = 'correct' | 'incorrect' | 'partially-correct' | null;

export interface ActiveElementCorrectionInterface {
  candidateCorrection: CandidateCorrection;
  readonly correctionPart: string;
}

type ActiveElement = HTMLElement & {
  readonly internals: ElementInternals;
  requestUpdate(name?: PropertyKey, oldValue?: unknown): unknown;
};

/** Adds candidate-verdict state to a lean choice/chip element. */
export const ActiveElementCorrectionMixin = <T extends AbstractConstructor<ActiveElement>>(superClass: T) => {
  abstract class ActiveElementCorrectionMixinClass extends superClass {
    #candidateCorrection: CandidateCorrection = null;

    public get candidateCorrection(): CandidateCorrection {
      return this.#candidateCorrection;
    }

    public set candidateCorrection(value: CandidateCorrection) {
      if (this.#candidateCorrection === value) return;
      const previous = this.#candidateCorrection;
      this.#candidateCorrection = value;

      const states = this.internals.states;
      states.delete('candidate-correct');
      states.delete('candidate-incorrect');
      states.delete('candidate-partially-correct');
      if (value) states.add(`candidate-${value}`);
      this.requestUpdate('candidateCorrection', previous);
    }

    public get correctionPart(): string {
      return this.#candidateCorrection ? `correction correction-${this.#candidateCorrection}` : 'correction';
    }
  }

  return ActiveElementCorrectionMixinClass as unknown as AbstractConstructor<ActiveElementCorrectionInterface> & T;
};
