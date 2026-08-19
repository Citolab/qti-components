import { createSeededRandom } from '../shared/prng';
import { shuffleKeepingFixed } from '../shared/shuffle';

const isLocal = (el: Element, ...names: string[]): boolean =>
  names.includes(el.localName) || names.includes(el.localName?.toLowerCase?.());

const isItemRef = (el: Element): boolean => isLocal(el, 'qti-assessment-item-ref', 'assessmentitemref');

const isSection = (el: Element): boolean => isLocal(el, 'qti-assessment-section', 'assessmentsection');

const attrIsTrue = (el: Element, ...names: string[]): boolean =>
  names.some(n => {
    const v = (el.getAttribute(n) ?? '').trim().toLowerCase();
    return v === 'true' || v === '1';
  });

const attrIsFalse = (el: Element, ...names: string[]): boolean =>
  names.some(n => {
    const v = (el.getAttribute(n) ?? '').trim().toLowerCase();
    return v === 'false' || v === '0';
  });

const isOrdering = (el: Element): boolean => isLocal(el, 'qti-ordering', 'ordering');

const isSelection = (el: Element): boolean => isLocal(el, 'qti-selection', 'selection');

const shuffleOrderingElements = (section: Element): Element[] =>
  Array.from(section.children).filter(child => isOrdering(child) && attrIsTrue(child, 'shuffle'));

const rngFor = (seed: string | number, key: string) => createSeededRandom(`${seed}:${key}`);

/** A movable unit in a section: one or more sibling nodes that move together. */
type Unit = { nodes: Element[]; fixed: boolean };

/**
 * The item refs of a subsection, in document order, plus the element children
 * that consuming the wrapper would discard.
 *
 * Descendant subsections are collected transitively: `orderSection` returns
 * early for a section without <qti-ordering>, so a wrapper nested inside a
 * non-shuffling subsection is never consumed there and has to be gathered here.
 */
function collectItemRefsDeep(section: Element): { itemRefs: Element[]; dropped: string[] } {
  const itemRefs: Element[] = [];
  const dropped: string[] = [];

  const walk = (el: Element): void => {
    for (const child of Array.from(el.children)) {
      if (isItemRef(child)) {
        itemRefs.push(child);
      } else if (isSection(child)) {
        walk(child);
      } else if (!isOrdering(child) && !isSelection(child)) {
        // Ordering/selection directives are transform config; anything else
        // (a rubric block, say) is authored content that the lift loses.
        dropped.push(child.localName);
      }
    }
  };
  walk(section);

  return { itemRefs, dropped };
}

function warnDroppedChildren(section: Element, dropped: string[]): void {
  if (dropped.length === 0) return;
  const identifier = section.getAttribute('identifier') ?? '(no identifier)';
  console.warn(
    `[qtiTransformTest] Subsection "${identifier}" is consumed by section ordering; ` +
      `discarding its ${[...new Set(dropped)].join(', ')}.`
  );
}

/**
 * Seed-deterministic QTI section shuffling.
 *
 * Reorders the children of every <qti-assessment-section> that carries a
 * <qti-ordering shuffle="true">, following QTI 3.0 ordering rules:
 *
 *  - Depth-first: a subsection orders its own children before the parent
 *    reorders it.
 *  - Item refs with fixed="true" stay in their authored position; the other
 *    units shuffle around them.
 *  - A subsection is a grouping device, not a delivered section: its item refs
 *    are lifted into the parent and the wrapper is consumed, just as the
 *    <qti-ordering> directive itself is. Nothing nested survives into the DOM,
 *    so the player only ever sees the authored top-level sections.
 *  - By default (QTI 3.0 defaults keep-together to true) a subsection travels as
 *    one unit: its items stay contiguous and keep their authored order, while
 *    the parent's remaining items shuffle around the block. Add fixed="true" to
 *    pin the block itself to its authored slot.
 *  - Only an explicit keep-together="false" dissolves a subsection: its
 *    (already internally ordered) item refs are poured into the parent pool and
 *    interleaved with the parent's own units.
 *
 * The same `seed` always produces the same order, so a restarted session keeps
 * its sequence. Each section draws from its own PRNG stream (seed + section id)
 * so sibling sections are independent and stable.
 */
function orderSection(section: Element, seed: string | number): void {
  // Depth-first: let every child section order itself first.
  for (const child of Array.from(section.children)) {
    if (isSection(child)) {
      orderSection(child, seed);
    }
  }

  const orderingEls = shuffleOrderingElements(section);
  if (orderingEls.length === 0) {
    return;
  }

  // Build the pool of movable units in document order. Config/structural
  // children (qti-ordering, qti-selection, rubric-block, …) are left in place.
  const units: Unit[] = [];
  const toDetach: Element[] = [];

  for (const child of Array.from(section.children)) {
    if (isItemRef(child)) {
      units.push({ nodes: [child], fixed: attrIsTrue(child, 'fixed') });
      toDetach.push(child);
    } else if (isSection(child)) {
      // Internal order is already settled: the depth-first pass above shuffled
      // this subsection if it carried its own <qti-ordering shuffle="true">, and
      // left the authored order alone otherwise.
      const { itemRefs, dropped } = collectItemRefsDeep(child);
      warnDroppedChildren(child, dropped);

      if (attrIsFalse(child, 'keep-together', 'keeptogether')) {
        // Explicitly dissolved: the items join the parent pool individually and
        // interleave with the parent's own items.
        for (const itemRef of itemRefs) {
          units.push({ nodes: [itemRef], fixed: attrIsTrue(itemRef, 'fixed') });
        }
      } else if (itemRefs.length > 0) {
        // One multi-node unit, so the items stay contiguous and keep their order
        // wherever the block lands.
        units.push({ nodes: itemRefs, fixed: attrIsTrue(child, 'fixed') });
      }

      toDetach.push(child); // the grouping wrapper is consumed
    }
  }

  // Where the reordered units go back in: after the last node we took out, so
  // any trailing structural children (a rubric block, say) keep their position.
  // Captured before detaching, and never itself a detached node.
  const anchor = toDetach.length > 0 ? toDetach[toDetach.length - 1].nextSibling : null;

  const sectionKey = section.getAttribute('identifier') ?? '';
  // A no-op for 0 or 1 movable units, but the re-insertion below still has to
  // run so consumed wrappers are lifted rather than left in the DOM.
  const ordered = shuffleKeepingFixed(units, rngFor(seed, sectionKey));

  for (const el of toDetach) {
    el.remove();
  }
  for (const unit of ordered) {
    for (const node of unit.nodes) {
      section.insertBefore(node, anchor);
    }
  }

  // Ordering directives are consumed by this transform step.
  for (const orderingEl of orderingEls) {
    orderingEl.remove();
  }
}

/** Whether anything in `doc` asks to be shuffled at all. */
export function hasShuffleOrdering(doc: XMLDocument): boolean {
  return Array.from(doc.getElementsByTagName('*')).some(el => isOrdering(el) && attrIsTrue(el, 'shuffle'));
}

/**
 * Mutates `doc` in place: shuffles every section flagged with
 * <qti-ordering shuffle="true">, deterministically from `seed`.
 */
export function shuffleSectionsOrdering(doc: XMLDocument, seed: string | number): void {
  const sections = Array.from(doc.getElementsByTagName('*')).filter(el => isSection(el));
  // Kick off recursion only for top-level sections; orderSection handles nesting
  // depth-first, so descendants are not double-processed.
  for (const section of sections) {
    // The snapshot above can contain wrappers that an ancestor has since
    // consumed. A detached element has no parentNode; a document element still
    // has one (the document), so this does not skip a section-rooted document.
    if (!section.parentNode) continue;

    const parent = section.parentElement;
    if (parent && isSection(parent)) continue;

    orderSection(section, seed);
  }
}
