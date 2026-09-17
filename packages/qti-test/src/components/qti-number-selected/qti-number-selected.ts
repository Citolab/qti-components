import { QtiExpression } from '@qti-components/base';

import { selectItemRefs, selectionFrom } from '../../internal/item-ref-selection';

import type { QtiAssessmentTest } from '../qti-assessment-test/qti-assessment-test';

/**
 * @summary The qti-number-selected expression counts the item refs selected for the test.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.number-selected
 *
 * Outcome processing only. `section-identifier`, `include-category` and
 * `exclude-category` narrow which item references are counted; with none of
 * them it is every item reference in the test.
 *
 * The count comes from the item refs in the document rather than the test
 * context, so it is the same set `qti-test-variables` aggregates over — and it
 * is right before any item has been attempted.
 */
export class QtiNumberSelected extends QtiExpression<number> {
  #connectedTest: QtiAssessmentTest | null = null;

  constructor() {
    super();
    this.addEventListener(
      'qti-assessment-test-connected',
      (e: CustomEvent<QtiAssessmentTest>) => (this.#connectedTest = e.detail)
    );
  }

  /**
   * `qti-assessment-test-connected` bubbles *up* from the test element, and this
   * expression lives inside that test's `qti-outcome-processing` — so the
   * listener above only ever fires for a test handed to us directly (a test
   * harness). Walking up the tree is what resolves the test in a real document.
   */
  get #testElement(): QtiAssessmentTest | null {
    return this.#connectedTest ?? this.closest<QtiAssessmentTest>('qti-assessment-test');
  }

  public override getResult(): number {
    const testElement = this.#testElement;
    if (!testElement) {
      console.warn('qti-number-selected: no enclosing qti-assessment-test, nothing to count');
      return 0;
    }

    return selectItemRefs(testElement, selectionFrom(this)).length;
  }

  public override calculate(): number {
    return this.getResult();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-number-selected': QtiNumberSelected;
  }
}
