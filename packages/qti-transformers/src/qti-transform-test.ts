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

import { loadXML, parseXML, setLocation, toHTML } from './shared/xml';
import { itemsFromTest } from './test/items';
import { shuffleSectionsOrdering } from './test/shuffle-sections';

export type transformTestApi = {
  load: (uri: string, signal?: AbortSignal) => Promise<transformTestApi>;
  parse: (xmlString: string) => transformTestApi;
  path: (location: string) => transformTestApi;
  fn: (fn: (xmlFragment: XMLDocument) => void) => transformTestApi;
  /**
   * Deterministically shuffle the children of every section that carries a
   * <qti-ordering shuffle="true">, honoring fixed items and nested
   * keep-together / visible rules. The same seed reproduces the same order.
   */
  shuffleOrdering: (seed?: string | number | null) => transformTestApi;
  items: () => { identifier: string; href: string; category: string }[];
  html: () => string;
  xml: () => string;
  htmlDoc: () => DocumentFragment;
  xmlDoc: () => XMLDocument;
};

export const qtiTransformTest = (): transformTestApi => {
  let xmlFragment: XMLDocument;
  let xmlUri = '';

  const api: transformTestApi = {
    async load(uri, signal) {
      return new Promise<transformTestApi>((resolve, _) => {
        loadXML(uri, signal).then(xml => {
          xmlFragment = xml;
          xmlUri = uri;

          api.path(uri.substring(0, uri.lastIndexOf('/')));
          return resolve(api);
        });
      });
    },
    parse(xmlString: string) {
      xmlFragment = parseXML(xmlString);
      xmlUri = '';
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
    shuffleOrdering(seed?: string | number | null) {
      const normalizedSeed = typeof seed === 'string' ? seed.trim() : seed;

      if (normalizedSeed === null || normalizedSeed === undefined || normalizedSeed === '') {
        const fallbackSeed = xmlUri || 'default-test-seed';
        console.warn(
          `[qtiTransformTest] No QTI_CONTEXT.seed provided; using "${fallbackSeed}" as deterministic fallback seed.`
        );
        shuffleSectionsOrdering(xmlFragment, fallbackSeed);
        return api;
      }

      shuffleSectionsOrdering(xmlFragment, normalizedSeed);
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
    htmlDoc() {
      return toHTML(xmlFragment);
    },
    xmlDoc(): XMLDocument {
      return xmlFragment;
    }
  };
  return api;
};
