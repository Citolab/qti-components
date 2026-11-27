import { createSeededRandom, shuffleKeepingFixed } from '@qti-components/delivery';

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

const isSessionControl = (el: Element): boolean => isLocal(el, 'qti-item-session-control', 'itemsessioncontrol');

/**
 * A `qti-ordering` this transform understands: only `shuffle` (and namespace declarations), no
 * child elements. Impl. guide §4.5.2: one with attributes or children a delivery system does not
 * recognise is an extension point for another algorithm, and is ignored entirely.
 */
const isStandardOrdering = (el: Element): boolean =>
  el.children.length === 0 &&
  Array.from(el.attributes).every(a => a.name === 'shuffle' || a.name === 'xmlns' || a.name.startsWith('xmlns:'));

const shuffleOrderingElements = (section: Element): Element[] =>
  Array.from(section.children).filter(
    child => isOrdering(child) && isStandardOrdering(child) && attrIsTrue(child, 'shuffle')
  );

const rngFor = (seed: string | number, key: string) => createSeededRandom(`${seed}:${key}`);

/** A movable unit in a section: one item-ref or one subsection, moved whole. */
type Unit = { node: Element; fixed: boolean };

/**
 * Impl. guide §4.5.2: "If visible="true" or keep-together="true" (the default), then the subsection
 * is shuffled as a unit"; only when both are false are its children "merged and shuffled together
 * with the items and subsections of the parent section".
 */
const dissolves = (section: Element): boolean =>
  attrIsFalse(section, 'visible') && attrIsFalse(section, 'keep-together', 'keeptogether');

/**
 * Hand a dissolved subsection's `qti-item-session-control` down to a child that leaves it: the
 * child's own attributes win, the subsection's fill the rest, as the cascade would have
 * (info model §7.19).
 */
function inheritSessionControl(child: Element, from: Element | undefined): void {
  if (!from) return;
  let own = Array.from(child.children).find(isSessionControl);
  if (!own) {
    own = child.ownerDocument.createElementNS(from.namespaceURI, from.tagName);
    child.insertBefore(own, child.firstChild);
  }
  for (const attribute of Array.from(from.attributes)) {
    if (!own.hasAttribute(attribute.name)) own.setAttribute(attribute.name, attribute.value);
  }
}

function warnDroppedChildren(section: Element, dropped: string[]): void {
  if (dropped.length === 0) return;
  const identifier = section.getAttribute('identifier') ?? '(no identifier)';
  console.warn(
    `[qtiTransformTest] Subsection "${identifier}" (visible="false", keep-together="false") is merged into its ` +
      `parent by section ordering; discarding its ${[...new Set(dropped)].join(', ')}.`
  );
}

/**
 * The units a subsection gives its shuffling parent: itself, or, when it dissolves, its own
 * item-refs and subsections (recursively, for a dissolving one among them), each taking the
 * subsection's session control along.
 */
function unitsOf(child: Element): Unit[] {
  if (isItemRef(child)) return [{ node: child, fixed: attrIsTrue(child, 'fixed') }];
  if (!dissolves(child)) return [{ node: child, fixed: attrIsTrue(child, 'fixed') }];

  const sessionControl = Array.from(child.children).find(isSessionControl);
  const dropped: string[] = [];
  const units: Unit[] = [];
  for (const grandchild of Array.from(child.children)) {
    if (isItemRef(grandchild) || isSection(grandchild)) {
      inheritSessionControl(grandchild, sessionControl);
      units.push(...unitsOf(grandchild));
    } else if (!isOrdering(grandchild) && !isSelection(grandchild) && !isSessionControl(grandchild)) {
      // Directives are transform config and session control is carried down; anything else (a
      // rubric block, a time limit, a pre-condition) belongs to the section that is going away.
      dropped.push(grandchild.localName);
    }
  }
  warnDroppedChildren(child, dropped);
  return units;
}

/**
 * Seed-deterministic QTI section shuffling (impl. guide §4.5.2).
 *
 * Reorders the children of every <qti-assessment-section> that carries a
 * <qti-ordering shuffle="true">:
 *
 *  - Depth-first: a subsection orders its own children before the parent
 *    reorders it.
 *  - Item refs and subsections with fixed="true" stay in their authored slot;
 *    the other units shuffle around them.
 *  - A subsection that is visible, or keeps together (QTI's default), moves as
 *    one unit: it stays a section, with its items in its own order.
 *  - A subsection with visible="false" and keep-together="false" dissolves: its
 *    item refs and subsections join the parent's pool and interleave with the
 *    parent's own units, taking the subsection's session control along.
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

  // The pool of movable units in document order. Other children (qti-ordering,
  // qti-selection, a rubric block, …) are left in place.
  const children = Array.from(section.children).filter(child => isItemRef(child) || isSection(child));
  const units = children.flatMap(unitsOf);

  // Where the reordered units go back in: after the last child we take out, so
  // any trailing structural children (a rubric block, say) keep their position.
  const anchor = children.length > 0 ? children[children.length - 1].nextSibling : null;

  const sectionKey = section.getAttribute('identifier') ?? '';
  const ordered = shuffleKeepingFixed(units, rngFor(seed, sectionKey));

  for (const child of children) {
    child.remove();
  }
  for (const unit of ordered) {
    section.insertBefore(unit.node, anchor);
  }

  // Ordering directives are consumed by this transform step.
  for (const orderingEl of orderingEls) {
    orderingEl.remove();
  }
}

/** Whether anything in `doc` asks to be shuffled at all. */
export function hasShuffleOrdering(doc: XMLDocument): boolean {
  return Array.from(doc.getElementsByTagName('*')).some(
    el => isOrdering(el) && isStandardOrdering(el) && attrIsTrue(el, 'shuffle')
  );
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
