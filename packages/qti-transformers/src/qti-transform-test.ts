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
  shuffleOrdering: (seed: string | number) => transformTestApi;
  items: () => { identifier: string; href: string; category: string }[];
  html: () => string;
  xml: () => string;
  htmlDoc: () => DocumentFragment;
  xmlDoc: () => XMLDocument;
};

export const qtiTransformTest = (): transformTestApi => {
  let xmlFragment: XMLDocument;

  const api: transformTestApi = {
    async load(uri, signal) {
      return new Promise<transformTestApi>((resolve, _) => {
        loadXML(uri, signal).then(xml => {
          xmlFragment = xml;

          api.path(uri.substring(0, uri.lastIndexOf('/')));
          return resolve(api);
        });
      });
    },
    parse(xmlString: string) {
      xmlFragment = parseXML(xmlString);
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
    shuffleOrdering(seed: string | number) {
      shuffleSectionsOrdering(xmlFragment, seed);
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
