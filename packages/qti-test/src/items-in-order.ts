import type { ComputedContext, ComputedItem } from '@qti-components/base';

/**
 * The items of a test part in the order the candidate takes them: the test's document order, info
 * items included. Flattening `testPart.sections` is not that order when a section's item-refs and
 * subsections interleave, since `sections` lists every section once, depth first.
 *
 * A part without `itemOrder` (a context built by hand) gives its sections' items as they are listed.
 */
export const itemsInOrder = (testPart: ComputedContext['testParts'][number]): ComputedItem[] => {
  const items = testPart.sections.flatMap(section => section.items);
  if (!testPart.itemOrder) return items;
  const byIdentifier = new Map(items.map(item => [item.identifier, item]));
  return testPart.itemOrder.flatMap(identifier => byIdentifier.get(identifier) ?? []);
};
