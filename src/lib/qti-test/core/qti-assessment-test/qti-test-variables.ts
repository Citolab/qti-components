import { consume } from '@lit/context';

import type { TestElement, TestContext } from '../../../exports/test.context';
import { testContext, testElement } from '../../../exports/test.context';
import type { QtiAssessmentItemRef } from './qti-assessment-item-ref';
import type { QtiExpressionBase } from '../../../exports/qti-expression';
import { QtiExpression } from '../../../exports/qti-expression';

// <qti-custom-operator definition="trim">
export class QtiTestVariables extends QtiExpression<number> {
  @consume({ context: testContext, subscribe: true })
  public _testContext?: TestContext;

  @consume({ context: testElement, subscribe: true })
  public _testElement?: TestElement;

  public override getResult() {
    // children can be a mix of qti-expression and qti-condition-expression
    const includedCategories = this.getAttribute('include-category')?.split(' ') ?? [];
    const excludedCategories = this.getAttribute('exclude-category')?.split(' ') ?? [];
    const weightIdentifier = this.getAttribute('weight-identifier') ?? '';
    const itemVariable = this.getAttribute('variable-identifier');

    const itemRefEls = Array.from<QtiAssessmentItemRef>(
      this._testElement.el.querySelectorAll<QtiAssessmentItemRef>(`qti-asssessment-test qti-assessment-item-ref`)
    );

    const includedItems = itemRefEls
      .filter(itemRef => {
        let include = true;
        if (includedCategories.length > 0) {
          include = includedCategories.includes(itemRef.category);
        }
        if (excludedCategories.length > 0) {
          include = !excludedCategories.includes(itemRef.category);
        }
        return include;
      })
      .map(itemRef => {
        let weight = 1;
        if (weightIdentifier) {
          const weightVariable = itemRef.weigths.get(weightIdentifier);
          if (weightVariable !== null && weightVariable !== undefined) {
            weight = weightVariable;
          }
        }
        return { item: itemRef.identifier, weight };
      });

    const logic = new QtiTestVariablesExpression(this._testContext, itemVariable, includedItems);
    const value = logic.calculate();
    return value;
  }

  public calculate() {
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
    const { items } = this.testContext;
    let total = 0;
    const uniqueItems = [...new Set(this.includedItems.map(item => item.item))];
    items.forEach(item => {
      if (uniqueItems.includes(item.identifier)) {
        const variable = item.variables.find(vr => vr.identifier === this.itemVariable);
        const weight = this.includedItems.find(i => i.item === item.identifier)?.weight ?? 1;
        if (variable) {
          total += Number(variable.value) * weight;
        }
      }
    });
    return total;
  }
}

customElements.define('qti-test-variables', QtiTestVariables);

declare global {
  interface HTMLElementTagNameMap {
    'qti-test-variables': QtiTestVariables;
  }
}
