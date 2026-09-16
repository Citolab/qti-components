import { QtiItem } from '@qti-components/item/elements';

import type { QtiAssessmentItem } from '@qti-components/elements';
import type { View } from '@qti-components/base';
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

  /**
   * Scorer view IS the answer key, the same pairing `QtiTestCorrection` makes at test level.
   * A marker switching to `scorer` to read the rubric would otherwise have to ask for the key
   * separately, and the two would drift apart.
   *
   * `scorer` alone because that is what the test side does — not because no other audience has
   * a use for a key. An author reviewing their own item plainly wants one, and arguably a tutor
   * does too. If that is ever granted it has to be granted in both places at once, or the same
   * item answers differently depending on whether it is delivered inside a test.
   */
  override updateAssessmentItemView(assessmentItem: QtiAssessmentItem, view: View): void {
    (assessmentItem as unknown as Partial<CorrectionAssessmentItem>)?.showCorrectResponse?.(view === 'scorer');
    this.updateControlState('item-show-correct-response', view === 'scorer');
  }

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
