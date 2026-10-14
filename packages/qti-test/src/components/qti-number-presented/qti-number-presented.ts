import { consume } from '@lit/context';

import { QtiExpression, testContext } from '@qti-components/base';

import { selectItemRefs, selectionFrom } from '../../internal/item-ref-selection';
import { listenPublic } from '../../public-events';

import type { TestContext } from '@qti-components/base';
import type { QtiAssessmentTest } from '../qti-assessment-test/qti-assessment-test';

/**
 * @summary The qti-number-presented expression counts the selected items that have been presented to the candidate.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.number-presented
 *
 * Outcome processing only. `section-identifier`, `include-category` and
 * `exclude-category` narrow which item references are counted, the same way as
 * for `qti-number-selected` and `qti-test-variables`.
 *
 * An item is presented once its `completionStatus` has left `not_attempted`:
 * presenting an item starts its first attempt. An item a linear test part
 * passed over (pre-condition, branch rule) or one the candidate has not reached
 * keeps `not_attempted`. That makes this the count to use for a total over the
 * candidate's own route, such as a maximum score of one point per presented item.
 */
export class QtiNumberPresented extends QtiExpression<number> {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  #connectedTest: QtiAssessmentTest | null = null;

  constructor() {
    super();
    listenPublic(this, 'cito-test-loaded', (e: CustomEvent<QtiAssessmentTest>) => (this.#connectedTest = e.detail));
  }

  /** The test this expression is in: handed over by a test harness, or found up the tree in a real document. */
  get #testElement(): QtiAssessmentTest | null {
    return this.#connectedTest ?? this.closest<QtiAssessmentTest>('qti-assessment-test');
  }

  public override getResult(): number {
    const testElement = this.#testElement;
    if (!testElement) {
      console.warn('qti-number-presented: no enclosing qti-assessment-test, nothing to count');
      return 0;
    }

    const presented = new Set(
      (this._testContext?.items ?? [])
        .filter(item => {
          const status = item.variables?.find(v => v.identifier === 'completionStatus')?.value;
          return status != null && status !== 'not_attempted';
        })
        .map(item => item.identifier)
    );
    return selectItemRefs(testElement, selectionFrom(this)).filter(itemRef => presented.has(itemRef.identifier)).length;
  }

  public override calculate(): number {
    return this.getResult();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-number-presented': QtiNumberPresented;
  }
}
