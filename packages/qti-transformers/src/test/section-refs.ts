import { loadXML } from '../shared/xml';

/**
 * `qti-assessment-section-ref` (QTI 3 info model §7.5): a section kept in a file of its own. The
 * reference is a facade: "the document that contains the reference, with the refered-to section
 * merged in, should behave exactly the same as a document that has all the same sections aggregated
 * in one document". So a loaded test has every reference replaced by the section it names, before
 * anything reads the test (ordering, the host's transform callback, the test model).
 */

const SECTION_REF = 'qti-assessment-section-ref';
const SECTION = 'qti-assessment-section';
const ITEM_REF = 'qti-assessment-item-ref';

/** The attributes `setLocation` makes absolute; a referenced section's are rebased the same way. */
const URL_ATTRIBUTES = ['src', 'href', 'srcset', 'poster'] as const;
const ABSOLUTE = /^(data:|https?:|blob:)/;

const isLocal = (el: Element, name: string) => el.localName === name || el.localName?.toLowerCase() === name;

const refsIn = (root: Document | Element): Element[] =>
  Array.from(root.getElementsByTagName('*')).filter(el => isLocal(el, SECTION_REF));

/** The folder part of a relative href, with its trailing slash: `sections/a.xml` → `sections/`. */
const folderOf = (href: string) => href.slice(0, href.lastIndexOf('/') + 1);

/** A key for cycle detection: `a/../b.xml` and `b.xml` are the same file. */
const keyOf = (url: string) => new URL(url, 'https://base.invalid/').href;

/**
 * Makes the relative URLs in a section that came from `folder` relative to the file that refers to
 * it, by putting `folder` in front, so the one `setLocation` pass over the test resolves them.
 */
function rebase(section: Element, folder: string): void {
  if (!folder) return;
  for (const el of [section, ...Array.from(section.getElementsByTagName('*'))]) {
    for (const attr of URL_ATTRIBUTES) {
      const value = el.getAttribute(attr)?.trim();
      if (value && !ABSOLUTE.test(value)) el.setAttribute(attr, folder + value);
    }
  }
}

/**
 * Replaces every `qti-assessment-section-ref` in `root` by the section its `href` names, fetched
 * relative to `location` (the folder of the file `root` came from, with a trailing slash).
 *
 * - The merged section takes the reference's `identifier`: a test may refer to one section file more
 *   than once, and each reference has its own identifier.
 * - A referenced section may itself refer to sections; those resolve relative to its own file.
 * - Relative URLs in a referenced section (its item-refs, images) are rewritten to be relative to the
 *   referring file, so they keep pointing where they did.
 *
 * Rejects when a file cannot be loaded, is not a single `qti-assessment-section`, or refers back to
 * itself through its references, and when the merged test repeats an item-ref identifier. QTI lets a
 * test refer to one section file more than once (§7.5) but requires unique item-ref identifiers
 * (§5.6); a file of item-refs referenced twice cannot satisfy both, and no identifier is invented to
 * make it (decided 2026-11-27).
 */
export async function resolveSectionRefs(root: XMLDocument, location: string, signal?: AbortSignal): Promise<void> {
  if (!hasSectionRefs(root)) return;
  await resolve(root, location, signal, []);

  const seen = new Set<string>();
  for (const itemRef of Array.from(root.getElementsByTagName('*')).filter(el => isLocal(el, ITEM_REF))) {
    const identifier = itemRef.getAttribute('identifier') ?? '';
    if (seen.has(identifier)) {
      throw new Error(
        `The test repeats ${ITEM_REF} "${identifier}" once its ${SECTION_REF}s are included; item-ref identifiers must be unique.`
      );
    }
    seen.add(identifier);
  }
}

async function resolve(
  root: XMLDocument,
  location: string,
  signal: AbortSignal | undefined,
  seen: readonly string[]
): Promise<void> {
  const base = location.endsWith('/') ? location : `${location}/`;
  for (const ref of refsIn(root)) {
    const href = ref.getAttribute('href')?.trim();
    if (!href) throw new Error(`${SECTION_REF} "${ref.getAttribute('identifier')}" has no href.`);

    const url = ABSOLUTE.test(href) ? href : base + encodeURI(href);
    const key = keyOf(url);
    if (seen.includes(key)) throw new Error(`${SECTION_REF} "${href}" refers back to itself.`);

    const doc = await loadXML(url, signal);
    const section = doc?.documentElement;
    if (!section || !isLocal(section, SECTION)) {
      throw new Error(`${SECTION_REF} "${href}" does not hold a single ${SECTION}.`);
    }

    await resolve(doc, url.slice(0, url.lastIndexOf('/') + 1), signal, [...seen, key]);
    if (!ABSOLUTE.test(href)) rebase(section, folderOf(href));

    const identifier = ref.getAttribute('identifier');
    if (identifier) section.setAttribute('identifier', identifier);
    ref.replaceWith(root.importNode(section, true));
  }
}

/** Whether a test still holds a `qti-assessment-section-ref`. */
export const hasSectionRefs = (root: Document): boolean => refsIn(root).length > 0;
