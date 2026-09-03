import { QtiTest, TestCheckItem, TestNavigation } from '@qti-components/test/elements';

import type { ComputedItem, View } from '@qti-components/base';
import type { QtiAssessmentItem } from '@qti-components/elements';

type CorrectionAssessmentItem = QtiAssessmentItem & {
  showCorrectResponse(show: boolean): void;
  showCandidateCorrection(show: boolean): void;
};

/** Test navigation extension that routes correction controls to the active item. */
export class TestNavigationCorrection extends TestNavigation {
  readonly #onShowCorrectResponse = (event: Event) => {
    (this.activeAssessmentItem as Partial<CorrectionAssessmentItem> | undefined)?.showCorrectResponse?.(
      (event as CustomEvent<boolean>).detail
    );
  };

  readonly #onShowCandidateCorrection = (event: Event) => {
    (this.activeAssessmentItem as Partial<CorrectionAssessmentItem> | undefined)?.showCandidateCorrection?.(
      (event as CustomEvent<boolean>).detail
    );
  };

  constructor() {
    super();
    this.addEventListener('test-show-correct-response', this.#onShowCorrectResponse);
    this.addEventListener('test-show-candidate-correction', this.#onShowCandidateCorrection);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('test-show-correct-response', this.#onShowCorrectResponse);
    this.removeEventListener('test-show-candidate-correction', this.#onShowCandidateCorrection);
    super.disconnectedCallback();
  }

  /**
   * Reflect correctness back to the candidate after an ended attempt, for items
   * the assessment opted in via the standard `qti-item-session-control
   * show-solution` (QTI 3.0 ItemSessionControl.show-solution) — the player takes
   * no opinion of its own:
   * - candidate correction (a mark on the learner's selection) after every attempt;
   * - the correct response (a mark on the right answer) once the item is done —
   *   the candidate reached the optimal outcome, or ran out of attempts.
   */
  protected override afterAttemptEnded(
    assessmentItem: QtiAssessmentItem | undefined,
    computedItem: ComputedItem | undefined,
    done: boolean
  ): void {
    if (!assessmentItem || !computedItem?.showSolution) return;

    const correctable = assessmentItem as Partial<CorrectionAssessmentItem>;
    correctable.showCandidateCorrection?.(true);
    correctable.showCorrectResponse?.(done);
  }
}

/** Test host extension that shows correct responses in scorer view. */
export class QtiTestCorrection extends QtiTest {
  public override updateAssessmentItemView(assessmentItem: QtiAssessmentItem, view: View): void {
    (assessmentItem as Partial<CorrectionAssessmentItem>).showCorrectResponse?.(view === 'scorer');
  }
}

/** Check-item extension that reveals the correct response after scoring. */
export class TestCheckItemCorrection extends TestCheckItem {
  constructor() {
    super();
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('test-show-correct-response', { detail: true, bubbles: true }));
    });
  }
}
