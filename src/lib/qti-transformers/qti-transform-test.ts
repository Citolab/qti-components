
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

import { extendElementName, itemsFromTest, loadXML, parseXML, toHTML } from "./qti-transformers";

export type transformTestApi = {
    load: (uri: string) => Promise<transformTestApi>;
    parse: (xmlString: string) => transformTestApi;
    extendElementName: (tagName: string, extend: string) => transformTestApi;
    fn: (fn: (xmlFragment: XMLDocument) => void) => transformTestApi;
    items: () => { identifier: string; href: string; category: string }[];
    html: () => string;
    xml: () => string;
    htmldoc: () => DocumentFragment;
    xmldoc: () => XMLDocument;
  }
  
  export const qtiTransformTest = (): transformTestApi => {
    let xmlFragment: XMLDocument;
  
    const api:transformTestApi = {
      async load(uri) {
        return new Promise<transformTestApi>((resolve, reject) => {
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
      extendElementName: (tagName: string, extend: string) => {
        extendElementName(xmlFragment, tagName, extend);
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
      htmldoc() {
        return toHTML(xmlFragment);
      },
      xmldoc(): XMLDocument {
        return xmlFragment;
      }
    };
    return api;
  };