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
import {
  convertCDATAtoComment,
  extendElementName,
  extendElementsWithClass,
  getShuffleQuerySelectorByTagName,
  loadXML,
  parseXML,
  setLocation,
  stripStyleSheets,
  toHTML
} from './qti-transformers';

export type transformItemApi = {
  load: (uri: string, cancelPreviousRequest?: boolean) => Promise<transformItemApi>;
  parse: (xmlString: string) => transformItemApi;
  path: (location: string) => transformItemApi;
  fn: (fn: (xmlFragment: XMLDocument) => void) => transformItemApi;
  pciHooks: (uri: string) => transformItemApi;
  extendElementName: (elementName: string, extend: string) => transformItemApi;
  extendElementsWithClass: (param?: string) => transformItemApi;
  customInteraction: (baseRef: string, baseItem: string) => transformItemApi;
  convertCDATAtoComment: () => transformItemApi;
  shuffleInteractions: () => transformItemApi;
  stripStyleSheets: () => transformItemApi;
  html: () => string;
  xml: () => string;
  htmlDoc: () => DocumentFragment;
  xmlDoc: () => XMLDocument;
};

export const qtiTransformItem = (cache: boolean = false) => {
  let xmlFragment: XMLDocument;

  const api: transformItemApi = {
    async load(uri: string, cancelPreviousRequest = false): Promise<typeof api> {
      const fullKey = encodeURI(uri);
      if (cache) {
        if (sessionStorage.getItem(fullKey)) {
          return Promise.resolve(api.parse(sessionStorage.getItem(fullKey)!));
        }
      }
      return new Promise<typeof api>(resolve => {
        loadXML(uri, cancelPreviousRequest).then(xml => {
          xmlFragment = xml;
          api.shuffleInteractions().path(uri.substring(0, uri.lastIndexOf('/')));
          if (cache) sessionStorage.setItem(fullKey, new XMLSerializer().serializeToString(xmlFragment));
          return resolve(api);
        });
      });
    },
    parse(xmlString: string): typeof api {
      xmlFragment = parseXML(xmlString);
      return api;
    },
    path: (location: string): typeof api => {
      setLocation(xmlFragment, location);
      return api;
    },
    fn(fn: (xmlFragment: XMLDocument) => void): typeof api {
      fn(xmlFragment);
      return api;
    },
    pciHooks(uri: string): typeof api {
      const attributes = ['hook', 'module'];
      const documentPath = uri.substring(0, uri.lastIndexOf('/'));
      for (const attribute of attributes) {
        const srcAttributes = xmlFragment.querySelectorAll('[' + attribute + ']');
        srcAttributes.forEach(node => {
          const srcValue = node.getAttribute(attribute)!;
          if (!srcValue.startsWith('data:') && !srcValue.startsWith('http')) {
            // Just paste the relative path of the src location after the documentrootPath
            // old pcis can have a .js, new pci's don't
            node.setAttribute('base-url', uri);
            node.setAttribute(
              'module',
              documentPath + '/' + encodeURI(srcValue + (srcValue.endsWith('.js') ? '' : '.js'))
            );
          }
        });
      }
      return api;
    },
    shuffleInteractions(): typeof api {
      const shuffleElements = xmlFragment.querySelectorAll(`[shuffle="true"]`);
      const shuffleInteractions = Array.from(shuffleElements).filter(e =>
        e.tagName?.toLowerCase().endsWith('-interaction')
      );

      for (const shuffleInteraction of shuffleInteractions) {
        const query = getShuffleQuerySelectorByTagName(shuffleInteraction.tagName.toLowerCase());
        const queries = Array.isArray(query) ? query : [query];

        for (const q of queries) {
          const choices = Array.from(shuffleInteraction.querySelectorAll(q)) as HTMLElement[];

          const fixedChoices = choices
            .map((choice, originalOrder) => ({
              element: choice,
              fixed: choice.hasAttribute('fixed') && choice.getAttribute('fixed') === 'true',
              originalOrder
            }))
            .filter(choice => choice.fixed);

          const nonFixedChoices = choices.filter(
            choice => !choice.hasAttribute('fixed') || choice.getAttribute('fixed') !== 'true'
          );

          if (nonFixedChoices.length <= 1) {
            console.warn('Shuffling is not possible with fewer than 2 non-fixed elements.');
            return api;
          }

          const originalOrder = [...nonFixedChoices];
          let shuffled = false;
          let attempts = 0;

          while (!shuffled && attempts < 20) {
            attempts++;
            for (let i = nonFixedChoices.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [nonFixedChoices[i], nonFixedChoices[j]] = [nonFixedChoices[j], nonFixedChoices[i]];
            }
            shuffled = !nonFixedChoices.every((choice, index) => choice === originalOrder[index]);
          }

          if (!shuffled) {
            console.warn('Failed to shuffle the choices after multiple attempts.');
            return null;
          }

          // Remove the shuffle attribute
          shuffleInteraction.removeAttribute('shuffle');

          // Reorder the elements in the DOM
          let nonFixedIndex = 0;
          for (const nonFixedChoice of nonFixedChoices) {
            nonFixedChoice.parentElement.insertBefore(nonFixedChoice, fixedChoices[nonFixedIndex]?.element);
            nonFixedIndex++;
          }
          for (const fixedChoice of fixedChoices) {
            fixedChoice.element.parentElement.insertBefore(
              fixedChoice.element,
              nonFixedChoices[fixedChoice.originalOrder]
            );
          }
        }
      }

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
      return new XMLSerializer().serializeToString(toHTML(xmlFragment));
    },
    xml(): string {
      return new XMLSerializer().serializeToString(xmlFragment);
    },
    htmlDoc() {
      return toHTML(xmlFragment);
    },
    xmlDoc(): XMLDocument {
      return xmlFragment; // new XMLSerializer().serializeToString(xmlFragment);
    }
  };
  return api;
};
