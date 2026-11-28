/**
 * Returns an object with methods to load, parse and transform QTI tests.
 * @returns An object with methods to load, parse and transform QTI tests.
 * @example
 * const qtiTransformer = qtiTransformTest();
 * await qtiTransformer.load('https://example.com/test.xml');
 * const items = qtiTransformer.items();
 * const html = qtiTransformer.html();
 * const xml = qtiTransformer.xml();
 */

import { warnMissingSeed } from './shared/missing-seed-warning';
import { loadXML, parseXML, setLocation, toHTML } from './shared/xml';
import { itemsFromTest } from './test/items';
import { hasSectionRefs, resolveSectionRefs } from './test/section-refs';
import { hasSelection, selectSections } from './test/select-sections';
import { hasShuffleOrdering, shuffleSectionsOrdering } from './test/shuffle-sections';

export type transformTestApi = {
  /** Fetches the test, includes every `qti-assessment-section-ref`'s section, and makes URLs absolute. */
  load: (uri: string, signal?: AbortSignal) => Promise<transformTestApi>;
  parse: (xmlString: string) => transformTestApi;
  path: (location: string) => transformTestApi;
  fn: (fn: (xmlFragment: XMLDocument) => void) => transformTestApi;
  /**
   * Apply every `qti-selection`: keep the item-refs and subsections each section selects, required
   * ones always, the same for the same seed (implementation guide §4.5.1). A `with-replacement` clone
   * is a copy of the item-ref or subsection with the next instance id (`item-3#2`). Run it before
   * `shuffleOrdering`, with the same seed. Throws for a selection QTI calls an error.
   */
  applySelection: (seed?: string | number | null) => transformTestApi;
  /**
   * Deterministically shuffle the children of every section that carries a
   * <qti-ordering shuffle="true">, honoring fixed items and nested
   * keep-together / visible rules. The same seed reproduces the same order.
   */
  shuffleOrdering: (seed?: string | number | null) => transformTestApi;
  items: () => { identifier: string; href: string; category: string }[];
  html: () => string;
  xml: () => string;
  htmlDoc: (registry?: CustomElementRegistry) => DocumentFragment;
  xmlDoc: () => XMLDocument;
};

export const qtiTransformTest = (): transformTestApi => {
  let xmlFragment: XMLDocument;
  let xmlUri = '';

  /** The host's seed, or a fixed one from the test's URL, with a warning, so a test still loads the same. */
  const seedOrFallback = (seed?: string | number | null): string | number => {
    const normalizedSeed = typeof seed === 'string' ? seed.trim() : seed;
    if (normalizedSeed !== null && normalizedSeed !== undefined && normalizedSeed !== '') return normalizedSeed;
    const fallbackSeed = xmlUri || 'default-test-seed';
    warnMissingSeed('qtiTransformTest', fallbackSeed);
    return fallbackSeed;
  };

  const api: transformTestApi = {
    // Awaits loadXML so a failed fetch (network, CORS, non-2xx) rejects this
    // promise. Callers own the failure: they can render it, retry it or let it
    // bubble — rather than it escaping as an unhandled rejection while their
    // own `await` never settles.
    //
    // Every qti-assessment-section-ref is replaced by the section it names, fetched relative to the
    // test, before anything else reads the test: QTI makes the reference a facade (info model §7.5).
    async load(uri, signal) {
      xmlFragment = await loadXML(uri, signal);
      xmlUri = uri;

      const location = uri.substring(0, uri.lastIndexOf('/'));
      await resolveSectionRefs(xmlFragment, location, signal);
      api.path(location);
      return api;
    },
    // A test given as a string has no location to fetch referenced sections from, so a
    // qti-assessment-section-ref stays as it is (with a warning) and its items are not in the test.
    parse(xmlString: string) {
      xmlFragment = parseXML(xmlString);
      xmlUri = '';
      if (hasSectionRefs(xmlFragment)) {
        console.warn(
          "[qtiTransformTest] qti-assessment-section-ref needs the test's location: load() the test by URL to include referenced sections."
        );
      }
      return api;
    },
    path: (location: string): typeof api => {
      setLocation(xmlFragment, location);
      return api;
    },
    fn(fn: (xmlFragment: XMLDocument) => void) {
      fn(xmlFragment);
      return api;
    },
    applySelection(seed?: string | number | null) {
      // Nothing to select: leave the test alone, and stay quiet about a missing seed.
      if (!hasSelection(xmlFragment)) return api;
      selectSections(xmlFragment, seedOrFallback(seed));
      return api;
    },
    shuffleOrdering(seed?: string | number | null) {
      // No section asks to be shuffled: leave the test alone, and stay quiet
      // about a missing seed that would never have been used.
      if (!hasShuffleOrdering(xmlFragment)) {
        return api;
      }
      shuffleSectionsOrdering(xmlFragment, seedOrFallback(seed));
      return api;
    },
    items() {
      return itemsFromTest(xmlFragment);
    },
    html() {
      return new XMLSerializer().serializeToString(toHTML(xmlFragment));
    },
    xml(): string {
      return new XMLSerializer().serializeToString(xmlFragment);
    },
    htmlDoc(registry?: CustomElementRegistry) {
      return toHTML(xmlFragment, registry);
    },
    xmlDoc(): XMLDocument {
      return xmlFragment;
    }
  };
  return api;
};
