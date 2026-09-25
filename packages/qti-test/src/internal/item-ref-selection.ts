import type { QtiAssessmentTest } from '../components/qti-assessment-test/qti-assessment-test';
import type { QtiAssessmentItemRef } from '../components/qti-assessment-item-ref/qti-assessment-item-ref';

/**
 * How the test-level expressions choose which item references they read.
 *
 * `qti-test-variables` and `qti-number-selected` select over the same set with
 * the same attributes, so the rules live here rather than in either element.
 */

/** `category`, `include-category` and `exclude-category` are space-separated lists. */
export const categoryList = (value: string | null | undefined): string[] => value?.split(/\s+/).filter(Boolean) ?? [];

export interface ItemRefSelection {
  /** Only item refs inside the section with this identifier; every section when absent. */
  sectionIdentifier?: string | null;
  includeCategories: string[];
  excludeCategories: string[];
}

/** Read the selection attributes an expression element carries. */
export const selectionFrom = (element: Element): ItemRefSelection => ({
  sectionIdentifier: element.getAttribute('section-identifier'),
  includeCategories: categoryList(element.getAttribute('include-category')),
  excludeCategories: categoryList(element.getAttribute('exclude-category'))
});

/**
 * The item refs of a test that a selection covers.
 *
 * Both category attributes may be present, and then both have to hold: an item
 * ref qualifies when it carries one of the included categories and none of the
 * excluded ones. Its own `category` is a list too, so matching any entry of it
 * is enough.
 */
export const selectItemRefs = (
  testElement: QtiAssessmentTest,
  { sectionIdentifier, includeCategories, excludeCategories }: ItemRefSelection
): QtiAssessmentItemRef[] => {
  // Scoped to the test element itself: the item refs are its descendants, not
  // the descendants of a further `qti-assessment-test` below it.
  const scope = sectionIdentifier
    ? testElement.querySelector(`qti-assessment-section[identifier="${CSS.escape(sectionIdentifier)}"]`)
    : testElement;
  if (!scope) {
    console.warn(`no qti-assessment-section with identifier "${sectionIdentifier}"`);
    return [];
  }

  return Array.from(scope.querySelectorAll<QtiAssessmentItemRef>('qti-assessment-item-ref')).filter(itemRef => {
    const categories = categoryList(itemRef.category);
    if (includeCategories.length > 0 && !categories.some(c => includeCategories.includes(c))) {
      return false;
    }
    if (excludeCategories.length > 0 && categories.some(c => excludeCategories.includes(c))) {
      return false;
    }
    return true;
  });
};
