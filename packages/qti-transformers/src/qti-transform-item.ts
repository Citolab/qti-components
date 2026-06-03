/**
 * Browser based QTI-XML to HTML transformer.
 * Returns an object with methods to load, parse, transform and serialize QTI XML items.
 * @returns An object with methods to load, parse, transform and serialize QTI XML items.
 * @example
 * const qtiTransformer = qtiTransformItem();
 * await qtiTransformer.load('path/to/xml/file.xml');
 * qtiTransformer.path('/assessmentItem/itemBody');
 * const html = qtiTransformer.html();
 * const xml = qtiTransformer.xml();
 * const htmldoc = qtiTransformer.htmldoc();
 * const xmldoc = qtiTransformer.xmldoc();
 *
 * qtiTransformItem().parse(storyXML).html()
 */
import { convertCDATAtoComment } from './item/cdata';
import { configurePci, type ModuleResolutionConfig } from './item/configure-pci';
import { extendElementName, extendElementsWithClass } from './item/extend';
import { pciHooks } from './item/pci-hooks';
import { shuffleInteractions } from './item/shuffle-interactions';
import { stripStyleSheets } from './item/stylesheets';
import { loadXML, parseXML, setLocation, toHTML } from './shared/xml';

export type { ModuleResolutionConfig };

export type LoadOptions = {
  signal?: AbortSignal;
  /** Whether to auto-run `shuffleInteractions()` after loading. Defaults to `true` for backwards compatibility. */
  shuffle?: boolean;
  /** Optional seed for deterministic interaction shuffling. When set, the same
   * seed reproduces the same choice order across reloads (e.g. session restart).
   * When omitted, shuffling falls back to Math.random (non-deterministic). */
  shuffleSeed?: string | number | null;
};

export type transformItemApi = {
  load: (uri: string, opts?: AbortSignal | LoadOptions) => Promise<transformItemApi>;
  parse: (xmlString: string) => transformItemApi;
  path: (location: string) => transformItemApi;
  fn: (fn: (xmlFragment: XMLDocument) => void) => transformItemApi;
  pciHooks: (uri: string) => transformItemApi;
  configurePci: (
    baseUrl: string,
    getModuleResolutionConfig: (baseUrl: string, fileUrl: string) => Promise<ModuleResolutionConfig>,
    selector?: string
  ) => Promise<transformItemApi>;
  extendElementName: (elementName: string, extend: string) => transformItemApi;
  extendElementsWithClass: (param?: string) => transformItemApi;
  customInteraction: (baseRef: string, baseItem: string) => transformItemApi;
  convertCDATAtoComment: () => transformItemApi;
  shuffleInteractions: (seed?: string | number | null) => transformItemApi;
  stripStyleSheets: () => transformItemApi;
  html: () => string;
  xml: () => string;
  htmlDoc: () => DocumentFragment;
  xmlDoc: () => XMLDocument;
};

export const qtiTransformItem = (cache: boolean = false) => {
  let xmlFragment: XMLDocument;
  let xmlUri = '';

  const api: transformItemApi = {
    load(uri: string, opts?: AbortSignal | LoadOptions) {
      const {
        signal,
        shuffle = true,
        shuffleSeed = null
      } = opts instanceof AbortSignal ? { signal: opts, shuffle: true, shuffleSeed: null } : (opts ?? {});
      xmlUri = uri;
      const fullKey = `${encodeURI(uri)}::qtiTransformItem:v2`;
      const applyLoadOptions = () => {
        if (shuffle) api.shuffleInteractions(shuffleSeed);
        return api;
      };
      if (cache) {
        const cachedXml = sessionStorage.getItem(fullKey);
        if (cachedXml) {
          api.parse(cachedXml);
          return Promise.resolve(applyLoadOptions());
        }
      }
      return loadXML(uri, signal).then(xml => {
        xmlFragment = xml;
        if (cache) sessionStorage.setItem(fullKey, new XMLSerializer().serializeToString(xmlFragment));
        return applyLoadOptions();
      });
    },
    parse(xmlString: string): typeof api {
      xmlFragment = parseXML(xmlString);
      return api;
    },
    path: (location: string): typeof api => {
      setLocation(xmlFragment, location);
      xmlUri = null;
      return api;
    },
    fn(fn: (xmlFragment: XMLDocument) => void): typeof api {
      fn(xmlFragment);
      return api;
    },
    pciHooks(uri: string): typeof api {
      pciHooks(xmlFragment, uri);
      return api;
    },
    async configurePci(
      baseUrl: string,
      getModuleResolutionConfig: (baseUrl: string, fileUrl: string) => Promise<ModuleResolutionConfig>,
      selector = 'qti-portable-custom-interaction'
    ): Promise<typeof api> {
      await configurePci(xmlFragment, baseUrl, getModuleResolutionConfig, selector);
      return api;
    },
    shuffleInteractions(seed?: string | number | null): typeof api {
      shuffleInteractions(xmlFragment, seed);
      return api;
    },
    extendElementName: (tagName: string, extension: string): typeof api => {
      extendElementName(xmlFragment, tagName, extension);
      return api;
    },
    extendElementsWithClass: (param: string = 'extend'): typeof api => {
      extendElementsWithClass(xmlFragment, param);
      return api;
    },
    customInteraction(baseRef: string, baseItem: string): typeof api {
      const qtiCustomInteraction = xmlFragment.querySelector('qti-custom-interaction');
      const qtiCustomInteractionObject = qtiCustomInteraction.querySelector('object');

      qtiCustomInteraction.setAttribute('data-base-ref', baseRef);
      qtiCustomInteraction.setAttribute('data-base-item', baseRef + baseItem);
      qtiCustomInteraction.setAttribute('data', qtiCustomInteractionObject.getAttribute('data'));
      qtiCustomInteraction.setAttribute('width', qtiCustomInteractionObject.getAttribute('width'));
      qtiCustomInteraction.setAttribute('height', qtiCustomInteractionObject.getAttribute('height'));

      qtiCustomInteraction.removeChild(qtiCustomInteractionObject);
      return api;
    },
    convertCDATAtoComment(): typeof api {
      convertCDATAtoComment(xmlFragment);
      return api;
    },
    stripStyleSheets(): typeof api {
      stripStyleSheets(xmlFragment);
      return api;
    },
    html() {
      if (xmlUri !== null) {
        setLocation(xmlFragment, xmlUri.substring(0, xmlUri.lastIndexOf('/')));
      }
      return new XMLSerializer().serializeToString(toHTML(xmlFragment));
    },
    xml(): string {
      return new XMLSerializer().serializeToString(xmlFragment);
    },
    htmlDoc() {
      if (xmlUri !== null) {
        setLocation(xmlFragment, xmlUri.substring(0, xmlUri.lastIndexOf('/')));
      }
      return toHTML(xmlFragment);
    },
    xmlDoc(): XMLDocument {
      return xmlFragment; // new XMLSerializer().serializeToString(xmlFragment);
    }
  };
  return api;
};
