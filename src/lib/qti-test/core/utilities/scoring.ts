// import type * as cheerio from 'cheerio';
import { QtiTestVariablesExpression } from '../qti-assessment-test/qti-test-variables';
import { QtiSetOutcomeValueRule, QtiSumExpression, QtiOutcomeProcessingProcessor } from '../../../qti-components';

import type { Element } from 'domhandler';
import type { QtiRuleBase } from '../../../qti-components';
import type { TestContext } from '../../../exports/test.context';
import type { VariableDeclaration } from '../../../exports/variables';
import type { QtiExpressionBase } from '../../../exports/qti-expression';

export const getRules = (
  $outcomeProcessing: Element,
  variables: VariableDeclaration<string | string[]>[],
  testContext: TestContext
) => {
  const rules: QtiRuleBase[] = [];
  $outcomeProcessing.children().each((_, $outcomeElement) => {
    rules.push(getRule($outcomeElement, variables, testContext));
  });
  return rules;
};

export const getRule = (
  ruleElement: Element,
  variables: VariableDeclaration<string | string[]>[],
  testContext: TestContext
): QtiRuleBase => {
  switch (ruleElement.tagName) {
    case 'qti-set-outcome-value': {
      return new QtiSetOutcomeValueNode(ruleElement, variables, testContext);
    }
    case 'qti-base-value': {
      return null;
      // TODO: implement this.
      // const baseValue = ruleElement.attribs['base-value'];
      // return new QtiSetOutcomeValue(baseValue);
    }
    default:
      throw new Error(`Unsupported rule element: ${ruleElement.tagName}`);
  }
};
export class QtiSetOutcomeValueNode<T> extends QtiSetOutcomeValueRule<T> {
  constructor(
    private $element: Element,
    private variables: VariableDeclaration<string | string[]>[],
    testContext?: TestContext
  ) {
    const expression = getChildExpression($element, variables, testContext);
    super(expression);
  }

  public override process() {
    const outcomeIdentifier = this.$element.attribs['identifier'];

    const value = super.process();
    // add variable to the variables if it does not exist yet
    let variableExists = false;
    for (const variable of this.variables) {
      if (variable.identifier === outcomeIdentifier) {
        variableExists = true;
        variable.value = value;
      }
    }
    if (!variableExists) {
      this.variables.push({ identifier: outcomeIdentifier, value, type: 'outcome' });
    }
    // this.dispatchEvent(
    //   new CustomEvent<{ outcomeIdentifier: string; value: string | string[] }>('qti-set-outcome-value', {
    //     bubbles: true,
    //     composed: true,
    //     detail: {
    //       outcomeIdentifier,
    //       value: Array.isArray(value) ? value.map((v: string) => convertNumberToUniveralFormat(v)) : convertNumberToUniveralFormat(value)
    //     }
    //   })
    // );
  }
}

const findParentElement = (element: Element, tagName: string): Element | null => {
  const parent = element?.parent as Element;
  if (!parent) return null;
  if (parent.tagName === tagName) return parent;
  return findParentElement(parent, tagName);
};

const findChildElements = (element: Element, tagName: string): Element[] | null => {
  // find all child elements with the given tagName independent of the depth
  const childElements: Element[] = [];
  element.children?.forEach(child => {
    if (child?.type === 'tag') {
      if (child.tagName === tagName) childElements.push(child);
      const childChildElements = findChildElements(child, tagName);
      if (childChildElements) childElements.push(...childChildElements);
    }
  });
  return childElements;
};

export const getChildExpression = (
  parentElement: Element,
  variables: VariableDeclaration<string | string[]>[],
  testContext?: TestContext
) => {
  const child = (parentElement.children?.find(c => c.type === 'tag') as Element) || null;
  return getExpression(child, variables, testContext) as unknown as QtiExpressionBase<any>;
};

export const getExpression = (
  child: Element,
  variables: VariableDeclaration<string | string[]>[],
  testContext?: TestContext
): QtiExpressionBase<unknown> => {
  if (!child) return null;
  switch (child.tagName) {
    // case 'qti-set-outcome-value': {
    //   // const childExpression = getChildExpression(child, variables, testContext);
    //   const setOutcomeValue = new QtiSetOutcomeValueNode(child, variables, testContext);
    //   // add variable to the variables

    //   return setOutcomeValue as QtiExpressionBase<any>;
    // }
    case 'qti-sum': {
      const childExpressions = getChildExpressions(child, variables, testContext);
      const sumExpression = new QtiSumExpression(childExpressions);
      return sumExpression;
    }
    case 'qti-test-variables': {
      const includedCategories = child.attribs['include-category']?.split(' ') ?? [];
      const excludedCategories = child.attribs['exclude-category']?.split(' ') ?? [];
      const weightIdentifier = child.attribs['weight-identifier'] ?? '';
      const itemVariable = child.attribs['variable-identifier'] ?? '';

      // one of the parentElements should be qti-assessment-test, qti-test-variables cannot be used otherwise
      const $assessmentTest = findParentElement(child, 'qti-assessment-test');
      const $itemsRefs = findChildElements($assessmentTest, 'qti-assessment-item-ref');
      const includedItems = $itemsRefs
        .map(itemRef => {
          const item = itemRef.attribs['identifier'];
          const category = itemRef.attribs['category'];
          const weightElements = findChildElements(itemRef, 'qti-weight');
          const weightValue = weightElements.find(w => w.attribs['identifier'] === weightIdentifier)?.attribs['value'];
          const weight = weightValue ? parseFloat(weightValue) : 1;
          return { item, category, weight };
        })
        .filter(item => {
          let include = true;
          if (includedCategories.length > 0) {
            include = includedCategories.includes(item.category);
          }
          if (excludedCategories.length > 0) {
            include = !excludedCategories.includes(item.category);
          }
          return include;
        });
      const qtiTestVariables = new QtiTestVariablesExpression(testContext, itemVariable, includedItems);
      return qtiTestVariables;
    }
    default: {
      return null;
    }
  }
};

export const getChildExpressions = (
  parentElement: Element,
  variables: VariableDeclaration<string | string[]>[],
  testContext?: TestContext
) => {
  const expressions: QtiExpressionBase<any>[] = [];
  parentElement.children?.forEach(child => {
    if (child?.type === 'tag') {
      const expression = getExpression(child, variables, testContext);
      if (expression) expressions.push(expression);
    }
  });
  return expressions;
};

export const processTestScores = (QtiOutcomeProcessing: Element, testContext: TestContext) => {
  const variables: VariableDeclaration<string | string[]>[] = [];

  const $assessmentTest = QtiOutcomeProcessing.closest('qti-assessment-test');
  const $outcomeDeclarationElements = $assessmentTest.children('qti-outcome-declaration');

  $outcomeDeclarationElements.each((_, $outcomeDeclarationElement) => {
    const outcomeIdentifier = $outcomeDeclarationElement.attribs['identifier'];
    const value = findChildElements($outcomeDeclarationElement, 'qti-value')
      .map(value =>
        value.children
          .filter(c => c.type === 'text')
          .map(c => (c as any).data)
          ?.join(' ')
      )
      .join(' ');
    // get the text of the elements

    variables.push({ identifier: outcomeIdentifier, value, type: 'outcome' });
  });
  const rules = getRules(QtiOutcomeProcessing, variables, testContext);
  const outcomeProcessing = new QtiOutcomeProcessingProcessor();
  outcomeProcessing.process(rules);
  return variables;
};
