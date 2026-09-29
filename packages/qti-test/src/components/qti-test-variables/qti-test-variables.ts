import { consume } from '@lit/context';

import { testContext } from '@qti-components/base';
import { QtiExpression } from '@qti-components/base';

import { selectItemRefs, selectionFrom } from '../../internal/item-ref-selection';

import type { QtiAssessmentTest } from '../qti-assessment-test/qti-assessment-test';
import type { TestContext } from '@qti-components/base';
import type { QtiExpressionBase } from '@qti-components/base';

export class QtiTestVariables extends QtiExpression<number> {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

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

  public override getResult() {
    const testElement = this.#testElement;
    if (!testElement) {
      console.warn('qti-test-variables: no enclosing qti-assessment-test, nothing to aggregate');
      return 0;
    }

    const weightIdentifier = this.getAttribute('weight-identifier') ?? '';
    const itemVariable = this.getAttribute('variable-identifier');

    const includedItems = selectItemRefs(testElement, selectionFrom(this)).map(itemRef => ({
      item: itemRef.identifier,
      weight: (weightIdentifier ? itemRef.weights.get(weightIdentifier) : undefined) ?? 1
    }));

    const logic = new QtiTestVariablesExpression(this._testContext, itemVariable, includedItems);
    const value = logic.calculate();
    return value;
  }

  public override calculate() {
    return this.getResult();
  }
}

export class QtiTestVariablesExpression implements QtiExpressionBase<number> {
  constructor(
    private testContext: TestContext,
    private itemVariable: string,
    private includedItems: { item: string; weight: number }[]
  ) {}

  calculate(): number {
    const items = this.testContext?.items ?? [];
    let total = 0;
    const uniqueItems = [...new Set(this.includedItems.map(item => item.item))];
    items.forEach(item => {
      if (uniqueItems.includes(item.identifier)) {
        const variable = item.variables.find(vr => vr.identifier === this.itemVariable);
        const weight = this.includedItems.find(i => i.item === item.identifier)?.weight ?? 1;
        if (variable) {
          // An unscored item carries a non-numeric value; counting it as NaN
          // would poison the whole total rather than just its own contribution.
          const value = Number(variable.value);
          if (!Number.isNaN(value)) {
            total += value * weight;
          }
        }
      }
    });
    return total;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-test-variables': QtiTestVariables;
  }
}
