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

// Type definition for module resolution config
export interface ModuleResolutionConfig {
  waitSeconds?: number;
  context?: string;
  catchError?: boolean;
  urlArgs?: string;
  paths: {
    [key: string]: string | string[];
  };
  shim?: {
    [key: string]: {
      deps?: string[]; // Array of dependencies
      exports?: string; // The global variable to use as the module's value
    };
  };
}

export type transformItemApi = {
  load: (uri: string) => { promise: Promise<transformItemApi>; request: XMLHttpRequest | null };
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
  shuffleInteractions: () => transformItemApi;
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
    load(uri: string) {
      xmlUri = uri;
      const fullKey = encodeURI(uri);
      if (cache) {
        if (sessionStorage.getItem(fullKey)) {
          return {
            promise: Promise.resolve(api.parse(sessionStorage.getItem(fullKey)!)),
            request: null
          };
        }
      }
      const { promise, xhr } = loadXML(uri);
      const a = new Promise<typeof api>(resolve => {
        promise.then(xml => {
          xmlFragment = xml;
          api.shuffleInteractions();
          if (cache) sessionStorage.setItem(fullKey, new XMLSerializer().serializeToString(xmlFragment));
          return resolve(api);
        });
      });

      return { promise: a, request: xhr };
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
    async configurePci(
      baseUrl: string,
      getModuleResolutionConfig: (baseUrl: string, fileUrl: string) => Promise<ModuleResolutionConfig>,
      selector = 'qti-portable-custom-interaction'
    ): Promise<typeof api> {
      const customInteractionTypeIdentifiers: string[] = [];
      const portableCustomInteractions = xmlFragment.querySelectorAll(selector);

      const moduleResolutionConfig = await getModuleResolutionConfig(baseUrl, '/modules/module_resolution.js');
      const moduleResolutionFallbackConfig = await getModuleResolutionConfig(
        baseUrl,
        '/modules/fallback_module_resolution.js'
      );

      if (portableCustomInteractions.length > 0) {
        for (const interaction of Array.from(portableCustomInteractions)) {
          // set data-base-url
          interaction.setAttribute('data-base-url', baseUrl);

          let customInteractionTypeIdentifier = interaction.getAttribute('custom-interaction-type-identifier');
          if (
            customInteractionTypeIdentifier &&
            customInteractionTypeIdentifiers.includes(customInteractionTypeIdentifier)
          ) {
            customInteractionTypeIdentifier = customInteractionTypeIdentifier + customInteractionTypeIdentifiers.length;
            interaction.setAttribute('custom-interaction-type-identifier', customInteractionTypeIdentifier);
            customInteractionTypeIdentifiers.push(customInteractionTypeIdentifier);
          }
          if (customInteractionTypeIdentifier) {
            customInteractionTypeIdentifiers.push(customInteractionTypeIdentifier);
          }

          // Check if qti-interaction-modules already exists
          let modulesElement = interaction.querySelector('qti-interaction-modules');

          // If it exists and has primary-configuration, handle that format
          if (modulesElement && modulesElement.getAttribute('primary-configuration')) {
            const primaryConfigPath = modulesElement.getAttribute('primary-configuration');
            if (primaryConfigPath) {
              try {
                // Load the primary configuration
                const primaryConfig = await getModuleResolutionConfig(baseUrl, `/${primaryConfigPath}`);

                // Get existing module elements that only have id attributes
                const existingModules = Array.from(modulesElement.querySelectorAll('qti-interaction-module'));

                // Update existing modules with paths from config
                for (const moduleEl of existingModules) {
                  const moduleId = moduleEl.getAttribute('id');
                  if (moduleId && primaryConfig.paths && primaryConfig.paths[moduleId]) {
                    const primaryPath = primaryConfig.paths[moduleId];
                    const primaryPathString = Array.isArray(primaryPath) ? primaryPath[0] : primaryPath;
                    moduleEl.setAttribute('primary-path', primaryPathString);

                    // Check for fallback path
                    if (
                      moduleResolutionFallbackConfig &&
                      moduleResolutionFallbackConfig.paths &&
                      moduleResolutionFallbackConfig.paths[moduleId]
                    ) {
                      const fallbackPath = moduleResolutionFallbackConfig.paths[moduleId];
                      if (Array.isArray(fallbackPath)) {
                        moduleEl.setAttribute('fallback-path', fallbackPath[0]);
                      } else {
                        moduleEl.setAttribute('fallback-path', fallbackPath);
                      }
                    }
                  }
                }

                // Add any additional modules from primary config that aren't already present
                if (primaryConfig.paths) {
                  for (const moduleId in primaryConfig.paths) {
                    const existingModule = modulesElement.querySelector(`qti-interaction-module[id="${moduleId}"]`);
                    if (!existingModule) {
                      const newModuleElement = xmlFragment.createElement('qti-interaction-module');
                      newModuleElement.setAttribute('id', moduleId);
                      const primaryPathString = Array.isArray(primaryConfig.paths[moduleId])
                        ? primaryConfig.paths[moduleId][0]
                        : primaryConfig.paths[moduleId];
                      newModuleElement.setAttribute('primary-path', primaryPathString);

                      // Check for fallback path
                      if (
                        moduleResolutionFallbackConfig &&
                        moduleResolutionFallbackConfig.paths &&
                        moduleResolutionFallbackConfig.paths[moduleId]
                      ) {
                        const fallbackPath = moduleResolutionFallbackConfig.paths[moduleId];
                        if (Array.isArray(fallbackPath)) {
                          newModuleElement.setAttribute('fallback-path', fallbackPath[0]);
                        } else {
                          newModuleElement.setAttribute('fallback-path', fallbackPath);
                        }
                      }

                      modulesElement.appendChild(newModuleElement);
                    }
                  }
                }

                // Apply urlArgs if present in config
                if (primaryConfig.urlArgs) {
                  modulesElement.setAttribute('url-args', primaryConfig.urlArgs);
                }
              } catch (error) {
                console.warn(`Failed to load primary configuration: ${primaryConfigPath}`, error);
              }
            }
          } else {
            // Original logic for when there's no existing qti-interaction-modules or no primary-configuration
            if (moduleResolutionConfig) {
              // Create qti-interaction-modules if it doesn't exist
              if (interaction.querySelector('qti-interaction-modules') === null) {
                modulesElement = xmlFragment.createElement('qti-interaction-modules');
                interaction.appendChild(modulesElement);
              } else {
                modulesElement = interaction.querySelector('qti-interaction-modules');
              }

              for (const module in moduleResolutionConfig.paths) {
                const path = moduleResolutionConfig.paths[module];
                let fallbackPath: string | string[] = '';

                if (
                  moduleResolutionFallbackConfig &&
                  moduleResolutionFallbackConfig.paths &&
                  moduleResolutionFallbackConfig.paths[module]
                ) {
                  fallbackPath = moduleResolutionFallbackConfig.paths[module];
                }

                const primaryArray = Array.isArray(path) ? path : [path];
                const fallbackPathArray = Array.isArray(fallbackPath) ? fallbackPath : [fallbackPath];

                // create an array with primary and fallback paths.
                const paths = primaryArray.map((primaryPath, i) => {
                  const fallbackPath = fallbackPathArray.length > i ? fallbackPathArray[i] : '';
                  return {
                    primaryPath,
                    fallbackPath
                  };
                });

                // check if all fallbackPath elements are in the array: paths, otherwise add
                for (const fallbackPath of fallbackPathArray) {
                  if (!paths.some(p => p.fallbackPath === fallbackPath)) {
                    paths.push({
                      primaryPath: primaryArray.length > 0 ? primaryArray[0] : fallbackPath,
                      fallbackPath
                    });
                  }
                }

                // add the paths to the qti-interaction-modules
                for (const path of paths) {
                  const moduleElement = xmlFragment.createElement('qti-interaction-module');
                  if (path.fallbackPath) {
                    moduleElement.setAttribute('fallback-path', path.fallbackPath);
                  }
                  moduleElement.setAttribute('id', module);
                  moduleElement.setAttribute('primary-path', path.primaryPath);

                  if (modulesElement) {
                    modulesElement.appendChild(moduleElement);
                  }
                }
              }
            }
          }
        }
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
