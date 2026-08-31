import { QtiItem } from '@qti-components/item/elements';

import type { CorrectResponseMode } from '../context/correction-config';

type CorrectionAssessmentItem = {
  showCorrectResponse(show: boolean): void;
  showCandidateCorrection(show: boolean): void;
};

/** Item host extension that handles correction controls and mode changes. */
export class QtiItemCorrection extends QtiItem {
  readonly #onShowCorrectResponse = (event: Event) => {
    const show = (event as CustomEvent<boolean>).detail;
    (this.assessmentItem as unknown as Partial<CorrectionAssessmentItem>)?.showCorrectResponse?.(show);
    this.updateControlState('item-show-correct-response', show);
  };

  readonly #onShowCandidateCorrection = (event: Event) => {
    const show = (event as CustomEvent<boolean>).detail;
    (this.assessmentItem as unknown as Partial<CorrectionAssessmentItem>)?.showCandidateCorrection?.(show);
    this.updateControlState('item-show-candidate-correction', show);
  };

  readonly #onSwitchCorrectResponseMode = (event: Event) => {
    (this.assessmentItem as unknown as Partial<CorrectionAssessmentItem>)?.showCorrectResponse?.(false);
    this.configContext = {
      ...this.configContext,
      correctResponseMode: (event as CustomEvent<CorrectResponseMode>).detail
    } as typeof this.configContext;
  };

  constructor() {
    super();
    this.addEventListener('item-show-correct-response', this.#onShowCorrectResponse);
    this.addEventListener('item-show-candidate-correction', this.#onShowCandidateCorrection);
    this.addEventListener('item-switch-correct-response-mode', this.#onSwitchCorrectResponseMode);
  }

  private updateControlState(selector: string, shown: boolean): void {
    this.querySelectorAll<HTMLElement & { shown: boolean }>(selector).forEach(control => (control.shown = shown));
  }

  override disconnectedCallback(): void {
    this.removeEventListener('item-show-correct-response', this.#onShowCorrectResponse);
    this.removeEventListener('item-show-candidate-correction', this.#onShowCandidateCorrection);
    this.removeEventListener('item-switch-correct-response-mode', this.#onSwitchCorrectResponseMode);
    super.disconnectedCallback();
  }
}
