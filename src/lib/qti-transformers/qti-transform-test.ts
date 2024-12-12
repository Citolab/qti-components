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

import { itemsFromTest, loadXML, parseXML, toHTML } from './qti-transformers';

export type transformTestApi = {
  load: (uri: string) => Promise<transformTestApi>;
  parse: (xmlString: string) => transformTestApi;
  fn: (fn: (xmlFragment: XMLDocument) => void) => transformTestApi;
  items: () => { identifier: string; href: string; category: string }[];
  html: () => string;
  xml: () => string;
  htmlDoc: () => DocumentFragment;
  xmlDoc: () => XMLDocument;
};

export const qtiTransformTest = (): transformTestApi => {
  let xmlFragment: XMLDocument;

  const api: transformTestApi = {
    async load(uri) {
      return new Promise<transformTestApi>((resolve, _) => {
        loadXML(uri).then(xml => {
          xmlFragment = xml;
          return resolve(api);
        });
      });
    },
    parse(xmlString: string) {
      xmlFragment = parseXML(xmlString);
      return api;
    },
    fn(fn: (xmlFragment: XMLDocument) => void) {
      fn(xmlFragment);
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
