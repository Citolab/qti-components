/** An element that evaluates to a boolean: a `qti-pre-condition` or `qti-branch-rule`. */
export interface Condition extends Element {
  evaluate(): boolean;
}

/** The expression a condition wraps: any QtiExpression, which answers with `calculate()`. */
interface Calculable extends Element {
  calculate(): unknown;
}

/**
 * Evaluate the single expression child of a pre-condition or branch rule. NULL counts as false.
 *
 * `onError` is what an expression that cannot be run means: a pre-condition fails open (`true`,
 * the item is shown) so a malformed package never hides content silently; a branch rule does not
 * branch (`false`).
 */
export function evaluateBooleanChild(element: Element, onError: boolean): boolean {
  const expression = element.firstElementChild as Calculable | null;
  if (!expression || typeof expression.calculate !== 'function') {
    console.warn(`<${element.localName}> has no evaluable expression child`, element);
    return onError;
  }
  try {
    const result = expression.calculate();
    return result === true || result === 'true';
  } catch (error) {
    console.warn(`<${element.localName}> could not evaluate its expression`, error);
    return onError;
  }
}
