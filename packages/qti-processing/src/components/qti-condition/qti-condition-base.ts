import { LitElement, html } from 'lit';

import { QtiRule } from '../qti-rule/qti-rule';

import type { QtiExpression } from '@qti-components/base';

/**
 * Shared logic for the QTI `responseCondition` / `outcomeCondition` family.
 *
 * Both conditions are structurally identical: a container that walks its
 * branches (if / else-if / else) in order and processes the sub-rules of the
 * first branch whose `shouldProcess()` returns true. The only difference
 * between response- and outcome- variants is the custom element tag name, so
 * the behaviour lives here and the concrete classes are empty subclasses that
 * `elements.ts` maps onto their tags.
 */

/**
 * A single branch of a condition (if / else-if / else). It owns the sub-rule
 * processing; subclasses decide whether the branch applies (`shouldProcess`)
 * and which of its children are sub-rules (`getSubRules`).
 */
export abstract class QtiConditionBranchBase extends LitElement {
  override render() {
    return html`<slot></slot>`;
  }

  /** Whether this branch's sub-rules should be processed. */
  public abstract shouldProcess(): boolean;

  /** The sub-rules to process when this branch applies. */
  public abstract getSubRules(): QtiRule[];

  public process() {
    const subRules = this.getSubRules();
    for (let i = 0; i < subRules.length; i++) {
      const subRule = subRules[i];
      subRule.process();
    }
  }
}

/**
 * The `else` branch: no condition (always applies), every child is a sub-rule.
 */
export abstract class QtiConditionElseBase extends QtiConditionBranchBase {
  public shouldProcess() {
    return true;
  }

  public getSubRules(): QtiRule[] {
    return [...this.children] as QtiRule[];
  }
}

/**
 * The `if` / `else-if` branch: first child is the boolean expression, the
 * remaining children are the sub-rules processed when it evaluates to true.
 */
export abstract class QtiConditionIfBase extends QtiConditionBranchBase {
  public shouldProcess() {
    const expression = this.firstElementChild as QtiExpression<boolean>;
    return expression.calculate();
  }

  public getSubRules(): QtiRule[] {
    const result = [];
    for (let i = 1; i < this.children.length; i++) {
      result.push(this.children[i] as QtiRule);
    }
    return result;
  }
}

/**
 * The condition container: walk branches in order, process the first whose
 * `shouldProcess()` is true, then stop.
 */
export abstract class QtiConditionBase extends QtiRule {
  override render() {
    return html`<slot></slot>`;
  }

  public override process() {
    const branches = [...this.children] as QtiConditionBranchBase[];

    for (const branch of branches) {
      if (branch.shouldProcess()) {
        branch.process();

        // The QTI spec evaluates branches as if / else-if / else: only the
        // first branch that applies runs, so once one matches we must skip the
        // remaining branches and stop.
        return;
      }
    }
  }
}
