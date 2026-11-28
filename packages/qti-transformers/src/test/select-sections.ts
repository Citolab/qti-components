import { createSeededRandom, itemInstanceId, selectUnits } from '@qti-components/delivery';

import { attrIsTrue, isItemRef, isSection, isSelection, sectionUnits } from './section-elements';

/**
 * A `qti-selection` this transform understands: `select` and `with-replacement` (and namespace
 * declarations), no child elements. Implementation guide §4.5.1: one with attributes or children the
 * delivery engine does not understand asks for another algorithm, and is ignored entirely.
 */
const isStandardSelection = (el: Element): boolean =>
  el.children.length === 0 &&
  Array.from(el.attributes).every(
    a => a.name === 'select' || a.name === 'with-replacement' || a.name === 'xmlns' || a.name.startsWith('xmlns:')
  );

const selectionOf = (section: Element): Element | undefined =>
  Array.from(section.children).find(child => isSelection(child) && isStandardSelection(child));

/**
 * Gives a clone and everything in it the next instance id of each identifier (`item-3#2`,
 * `sectionB#2`), so every rendered item-ref and section stays unique and each cloned section draws
 * its own selection and ordering. The first instance keeps the authored identifier.
 */
function renameClone(clone: Element, instances: Map<string, number>): void {
  for (const el of [clone, ...Array.from(clone.getElementsByTagName('*'))]) {
    if (!isItemRef(el) && !isSection(el)) continue;
    const identifier = el.getAttribute('identifier') ?? '';
    const occurrence = (instances.get(identifier) ?? 1) + 1;
    instances.set(identifier, occurrence);
    el.setAttribute('identifier', itemInstanceId(identifier, occurrence));
  }
}

/** Applies a section's own `qti-selection`, then those of the subsections it kept, top down. */
function selectSection(section: Element, seed: string | number, instances: Map<string, number>): void {
  const selection = selectionOf(section);
  if (selection) {
    const identifier = section.getAttribute('identifier') ?? '';
    const children = sectionUnits(section);
    let selected: number[];
    try {
      selected = selectUnits(
        children.map(child => ({ required: attrIsTrue(child, 'required') })),
        {
          select: Number(selection.getAttribute('select') ?? Number.NaN),
          withReplacement: attrIsTrue(selection, 'with-replacement')
        },
        createSeededRandom(`${seed}:select:${identifier}`)
      );
    } catch (error) {
      throw new RangeError(`[qtiTransformTest] Section "${identifier}": ${(error as Error).message}`);
    }

    // Unselected children go; a child selected again gets its clones right after it, so the
    // authored order stays for ordering to shuffle (§4.5.1).
    const kept = new Set(selected);
    for (const [index, child] of children.entries()) {
      if (!kept.has(index)) child.remove();
    }
    let previous: number | null = null;
    let last: Element | null = null;
    for (const index of selected) {
      if (index !== previous) {
        last = children[index];
      } else {
        const clone = children[index].cloneNode(true) as Element;
        renameClone(clone, instances);
        last!.after(clone);
        last = clone;
      }
      previous = index;
    }
    selection.remove();
  }

  for (const child of sectionUnits(section)) {
    if (isSection(child)) selectSection(child, seed, instances);
  }
}

/** Whether anything in `doc` asks for a selection this transform applies. */
export function hasSelection(doc: XMLDocument): boolean {
  return Array.from(doc.getElementsByTagName('*')).some(el => isSelection(el) && isStandardSelection(el));
}

/**
 * Mutates `doc` in place: applies every `qti-selection` (implementation guide §4.5.1), top down, so a
 * subsection's own selection runs only when the subsection is selected. Each section draws from its
 * own stream (`seed:select:sectionId`), apart from ordering's, so the same seed selects the same
 * items and a test without selection keeps its order. Throws a `RangeError` for a selection QTI
 * calls an error.
 */
export function selectSections(doc: XMLDocument, seed: string | number): void {
  const instances = new Map<string, number>();
  const topLevel = Array.from(doc.getElementsByTagName('*')).filter(
    el => isSection(el) && !(el.parentElement && isSection(el.parentElement))
  );
  for (const section of topLevel) selectSection(section, seed, instances);
}
