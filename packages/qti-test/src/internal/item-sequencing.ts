import { QtiBranchRule } from '../components/qti-branch-rule/qti-branch-rule';

import type { Condition } from './evaluate-condition';

const SECTION = 'qti-assessment-section';
const TEST_PART = 'qti-test-part';

/** The item-ref identifier, also before the element is upgraded. */
export const idOf = (ref: Element): string =>
  (ref as Element & { identifier?: string }).identifier || ref.getAttribute('identifier') || '';

export interface NextItem {
  /** The item ref to present next, or `null` when the test (part) ends. */
  id: string | null;
  /** The item refs passed over on the way, in document order. */
  skipped: string[];
}

/**
 * The item to present after `refs[current]`, applying branch rules and then pre-conditions.
 *
 * Branch rules: those of the item ref first, then those of each section / test part it was the
 * last item of; the first one that is true wins. A target that is not ahead of the current item
 * is ignored. Pre-conditions: those of the candidate item ref and of every section / test part it
 * would enter. Items skipped this way are not presented.
 *
 * @param refs every item ref of the test, in document order
 * @param current index in `refs` of the item that was just presented
 */
export function resolveNextItem(refs: Element[], current: number): NextItem {
  const from = refs[current];
  let start = current + 1;

  const rule = firstFiringBranchRule(from, refs, current);
  if (rule) {
    const target = branchTargetIndex(rule, refs, current);
    if (target === null) return { id: null, skipped: refs.slice(current + 1).map(idOf) };
    if (target > current) start = target;
    else console.warn(`qti-branch-rule target "${rule.target}" is not ahead of "${idOf(from)}", ignored`);
  }

  const skipped = refs.slice(current + 1, start).map(idOf);
  for (let i = start; i < refs.length; i++) {
    if (preConditionsPass(refs[i], from)) return { id: idOf(refs[i]), skipped };
    skipped.push(idOf(refs[i]));
  }
  return { id: null, skipped };
}

function firstFiringBranchRule(itemRef: Element, refs: Element[], current: number): QtiBranchRule | null {
  const owners: Element[] = [itemRef];
  for (
    let el = itemRef.parentElement;
    el && (el.localName === SECTION || el.localName === TEST_PART);
    el = el.parentElement
  ) {
    if (el.contains(refs[current + 1] ?? null)) break; // not the last item of this container
    owners.push(el);
  }
  for (const owner of owners) {
    for (const rule of owner.querySelectorAll<QtiBranchRule>(':scope > qti-branch-rule')) {
      if (rule.evaluate?.()) return rule;
    }
  }
  return null;
}

/** Index of the first item ref to consider after a branch, or null for EXIT_TEST / leaving the last part. */
function branchTargetIndex(rule: QtiBranchRule, refs: Element[], current: number): number | null {
  const owner = rule.parentElement as Element;
  const firstAfter = (container: Element | null): number | null => {
    if (!container) return null;
    const last = refs.findLastIndex(ref => container.contains(ref));
    return last + 1 < refs.length ? last + 1 : null;
  };

  switch (rule.target) {
    case QtiBranchRule.EXIT_TEST:
      return null;
    case QtiBranchRule.EXIT_TESTPART:
      return firstAfter(owner.closest(TEST_PART));
    case QtiBranchRule.EXIT_SECTION: {
      const section =
        owner.localName === SECTION ? (owner.parentElement?.closest(SECTION) ?? owner) : owner.closest(SECTION);
      return firstAfter(section ?? owner);
    }
    default: {
      const byRef = refs.findIndex(ref => idOf(ref) === rule.target);
      if (byRef >= 0) return byRef;
      const container = owner
        .closest('qti-assessment-test')
        ?.querySelector(`${SECTION}[identifier="${rule.target}"], ${TEST_PART}[identifier="${rule.target}"]`);
      const inside = container ? refs.findIndex(ref => container.contains(ref)) : -1;
      if (inside >= 0) return inside;
      console.warn(`qti-branch-rule target "${rule.target}" not found`);
      return current + 1;
    }
  }
}

function preConditionsPass(itemRef: Element, from: Element): boolean {
  const owners: Element[] = [itemRef];
  for (
    let el = itemRef.parentElement;
    el && (el.localName === SECTION || el.localName === TEST_PART);
    el = el.parentElement
  ) {
    if (!el.contains(from)) owners.push(el);
  }
  return owners.every(owner =>
    [...owner.querySelectorAll<Condition>(':scope > qti-pre-condition')].every(
      condition => condition.evaluate?.() ?? true
    )
  );
}
