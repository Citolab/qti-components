import { QtiExpression, ScoringHelper } from '@qti-components/base';

import type { BaseType, ResponseVariable } from '@qti-components/base';

/**
 * @summary The qti-contains operator tests whether one container holds another.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/info/index.html#contains
 *
 * Takes 2 sub-expressions of the same base-type and the same cardinality,
 * either both multiple or both ordered.
 *
 * Cardinality decides what containment means. An unordered container holds
 * another when every one of its values is present, multiplicity included and
 * order disregarded: `[A,B,C]` contains `[C,A]`. An ordered container needs the
 * second to appear as a strict sub-sequence: `[A,B,C]` contains `[B,C]` but not
 * `[C,A]`.
 *
 * Special cases: Returns NULL if either sub-expression is NULL.
 */
export class QtiContains extends QtiExpression<boolean | null> {
  public override getResult(): boolean | null {
    if (this.children.length !== 2) {
      console.error('qti-contains takes two sub-expressions');
      return null;
    }

    const [container, sub] = this.getVariables() as ResponseVariable[];
    if (!container || !sub) {
      return null;
    }

    // If either sub-expression is NULL then the result of the operator is NULL.
    if (container.value === null || container.value === undefined || sub.value === null || sub.value === undefined) {
      return null;
    }

    if (container.baseType !== sub.baseType) {
      console.warn('qti-contains: both sub-expressions should have the same base-type');
    }

    const baseType = container.baseType ?? sub.baseType;

    /*
     * Not what the spec describes — it requires both operands to be containers
     * — but items in the wild write `contains` with a single first operand and
     * mean "is this value in that container", which is `qti-member`. Answering
     * that rather than returning false keeps those items scoring; the warning
     * is there so the authoring gets fixed.
     */
    if (container.cardinality === 'single' && sub.cardinality !== 'single') {
      console.warn('qti-contains: first sub-expression is single; treating it as a membership test');
      return this.#toArray(sub.value).some(candidate => this.#equal(candidate, container.value as string, baseType));
    }

    const haystack = this.#toArray(container.value);
    const needle = this.#toArray(sub.value);

    // An empty container is contained in anything.
    if (needle.length === 0) return true;

    return container.cardinality === 'ordered' && sub.cardinality === 'ordered'
      ? this.#containsSubSequence(haystack, needle, baseType)
      : this.#containsSubMultiset(haystack, needle, baseType);
  }

  #toArray(value: Readonly<string | string[]>): string[] {
    return Array.isArray(value) ? [...value] : [value as string];
  }

  /**
   * `ScoringHelper.compareSingleValues` knows how each base type compares — a
   * `pair` ignoring the order within it, numbers compared numerically. It
   * returns false for a base type it has no case for, so an unknown one falls
   * back to comparing the values as written.
   */
  #equal(a: string, b: string, baseType: BaseType): boolean {
    return ScoringHelper.compareSingleValues(a, b, baseType) || a === b;
  }

  /** Every needle value present, multiplicity respected, order disregarded. */
  #containsSubMultiset(haystack: string[], needle: string[], baseType: BaseType): boolean {
    const remaining = [...haystack];
    return needle.every(value => {
      const index = remaining.findIndex(candidate => this.#equal(candidate, value, baseType));
      if (index === -1) return false;
      // Consumed, so a value needed twice has to appear twice.
      remaining.splice(index, 1);
      return true;
    });
  }

  /** The needle appearing contiguously, in order, somewhere in the haystack. */
  #containsSubSequence(haystack: string[], needle: string[], baseType: BaseType): boolean {
    for (let start = 0; start + needle.length <= haystack.length; start++) {
      if (needle.every((value, offset) => this.#equal(haystack[start + offset], value, baseType))) {
        return true;
      }
    }
    return false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-contains': QtiContains;
  }
}
