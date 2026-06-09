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

const shuffleOrderingElements = (section: Element): Element[] =>
  Array.from(section.children).filter(
    child => isLocal(child, 'qti-ordering', 'ordering') && attrIsTrue(child, 'shuffle')
  );

const rngFor = (seed: string | number, key: string) => createSeededRandom(`${seed}:${key}`);

/** A movable unit in a section: one or more sibling nodes that move together. */
type Unit = { nodes: Element[]; fixed: boolean };

/**
 * Seed-deterministic QTI section shuffling.
 *
 * Reorders the children of every <qti-assessment-section> that carries a
 * <qti-ordering shuffle="true">, following QTI 3.0 selection/ordering rules:
 *
 *  - Depth-first: a child section orders its own children before the parent
 *    reorders it.
 *  - Item refs with fixed="true" stay in their authored position; the other
 *    units shuffle around them.
 *  - A child section with keep-together="true" OR visible="true" moves as a
 *    single block (its items stay grouped and internally ordered).
 *  - A child section with keep-together="false" AND visible="false" is
 *    dissolved: its (already internally ordered) item refs are poured into the
 *    parent pool and interleaved with the parent's own units.
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
      const asBlock = attrIsTrue(child, 'keep-together', 'keeptogether') || attrIsTrue(child, 'visible');
      if (asBlock) {
        // Stays grouped, internal order already applied by recursion.
        units.push({ nodes: [child], fixed: attrIsTrue(child, 'fixed') });
        toDetach.push(child);
      } else {
        // Dissolve: promote its ordered selectable children as individual units.
        for (const inner of Array.from(child.children)) {
          if (isItemRef(inner) || isSection(inner)) {
            units.push({ nodes: [inner], fixed: attrIsTrue(inner, 'fixed') });
          }
        }
        toDetach.push(child); // the wrapper section disappears
      }
    }
  }

  if (units.length <= 1) {
    for (const orderingEl of orderingEls) {
      orderingEl.remove();
    }
    return;
  }

  const sectionKey = section.getAttribute('identifier') ?? '';
  const ordered = shuffleKeepingFixed(units, rngFor(seed, sectionKey));

  // Detach movable nodes (and dissolved wrappers) from the DOM, then re-append
  // the reordered units after whatever config children remain.
  for (const el of toDetach) {
    el.remove();
  }
  for (const unit of ordered) {
    for (const node of unit.nodes) {
      section.appendChild(node);
    }
  }

  // Ordering directives are consumed by this transform step.
  for (const orderingEl of orderingEls) {
    orderingEl.remove();
  }
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
    const parent = section.parentElement;
    if (!parent || !isSection(parent)) {
      orderSection(section, seed);
    }
  }
}
