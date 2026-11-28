import { setState } from '@qti-components/base';

type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

export type CandidateCorrection = 'correct' | 'incorrect' | 'partially-correct' | null;

/**
 * The `:state()` name of a verdict (CONTRACT.md §3): `candidate-correct`, `candidate-incorrect`,
 * `candidate-partial`. The third is the one place the state name is not `candidate-` + the value:
 * the old `candidate-partially-correct` is kept as an alias by `setState` for one major.
 */
export const verdictState = (value: Exclude<CandidateCorrection, null>): string =>
  value === 'partially-correct' ? 'candidate-partial' : `candidate-${value}`;

/** The three verdict states, cleared together whenever a verdict changes. */
export const VERDICT_STATES = ['candidate-correct', 'candidate-incorrect', 'candidate-partial'] as const;

/**
 * The badge's part: `correction`, plus the verdict as a second token and, for one major, the old
 * suffixed token (`correction candidate-partial correction-partially-correct`).
 */
export const correctionPartFor = (value: CandidateCorrection): string =>
  value ? `correction ${verdictState(value)} correction-${value}` : 'correction';

/** Sets the verdict states on `states`: all three cleared (with their aliases), then one set. */
export const applyVerdictStates = (
  states: ElementInternals['states'] | undefined,
  value: CandidateCorrection
): void => {
  for (const name of VERDICT_STATES) setState(states, name, false);
  if (value) setState(states, verdictState(value), true);
};

export interface ActiveElementCorrectionInterface {
  candidateCorrection: CandidateCorrection;
  readonly correctionPart: string;
}

type ActiveElement = HTMLElement & {
  readonly internals: ElementInternals;
  requestUpdate(name?: PropertyKey, oldValue?: unknown): unknown;
};

/**
 * Adds candidate-verdict state to a lean choice/chip element.
 *
 * @cssstate candidate-correct - The candidate's answer on this element is correct.
 * @cssstate candidate-incorrect - The candidate's answer on this element is incorrect.
 * @cssstate candidate-partial - The candidate's answer on this element is partially correct (alias `candidate-partially-correct`, one major).
 * @csspart correction - The verdict badge; its second token is the verdict state (`candidate-correct`, `candidate-incorrect`, `candidate-partial`), followed by the old `correction-<verdict>` token for one major.
 */
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

      applyVerdictStates(this.internals.states, value);
      this.requestUpdate('candidateCorrection', previous);
    }

    public get correctionPart(): string {
      return correctionPartFor(this.#candidateCorrection);
    }
  }

  return ActiveElementCorrectionMixinClass as unknown as AbstractConstructor<ActiveElementCorrectionInterface> & T;
};
