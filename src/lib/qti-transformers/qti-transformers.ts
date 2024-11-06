const xml = String.raw;

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
  stripStyleSheets: () => transformItemApi;
  html: () => string;
  xml: () => string;
  htmldoc: () => DocumentFragment;
  xmldoc: () => XMLDocument;
};

export const qtiTransformItem = () => {
  let xmlFragment: XMLDocument;

  const api: transformItemApi = {
    async load(uri: string, cancelPreviousRequest = false): Promise<typeof api> {
      return new Promise<typeof api>((resolve, reject) => {
        loadXML(uri, cancelPreviousRequest).then(xml => {
          xmlFragment = xml;
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
    htmldoc() {
      return toHTML(xmlFragment);
    },
    xmldoc(): XMLDocument {
      return xmlFragment; // new XMLSerializer().serializeToString(xmlFragment);
    }
  };
  return api;
};

export const qtiTransformManifest = (): {
  load: (uri: string) => Promise<typeof api>;
  assessmentTest: () => { href: string; identifier: string };
} => {
  let xmlFragment: XMLDocument;

  const api = {
    async load(uri) {
      return new Promise<typeof api>((resolve, reject) => {
        loadXML(uri).then(xml => {
          xmlFragment = xml;
          return resolve(api);
        });
      });
    },
    parse(xmlString: string) {
      xmlFragment = parseXML(xmlString);
    },
    assessmentTest() {
      const el = xmlFragment.querySelector('resource[type="imsqti_test_xmlv3p0"]');
      return { href: el.getAttribute('href'), identifier: el.getAttribute('identifier') };
    }
  };
  return api;
};

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

/*   <!-- convert CDATA to comments -->
  <xsl:template match="text()[contains(., 'CDATA')]">
  <xsl:comment>
    <xsl:value-of select="."/>
  </xsl:comment>
</xsl:template>
*/

/*
  <!-- remove xml comments -->
  <xsl:template match="comment()" />
  */

const xmlToHTML = xml`<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <!-- remove existing namespaces -->
  <xsl:template match="*">
    <!-- remove element prefix -->
    <xsl:element name="{local-name()}">
      <!-- process attributes -->
      <xsl:for-each select="@*">
        <!-- remove attribute prefix -->
        <xsl:attribute name="{local-name()}">
          <xsl:value-of select="."/>
        </xsl:attribute>
      </xsl:for-each>
    <xsl:apply-templates/>
  </xsl:element>
</xsl:template>
</xsl:stylesheet>`;

// Function to extend elements with a specific tag name by adding an extension suffix
function extendElementName(xmlFragment: XMLDocument, tagName: string, extension: string) {
  xmlFragment.querySelectorAll(tagName).forEach(element => {
    const newTagName = `${tagName}-${extension}`;
    const newElement = createElementWithNewTagName(element, newTagName);
    element.replaceWith(newElement);
  });
}

// Function to extend any element with a specific class pattern (e.g., "extend:suffix")
function extendElementsWithClass(xmlFragment: XMLDocument, classNamePattern: string) {
  xmlFragment.querySelectorAll('*').forEach(element => {
    const classList = element.classList;
    if (classList) {
      classList.forEach(className => {
        if (className.startsWith(`${classNamePattern}:`)) {
          const suffix = className.slice(`${classNamePattern}:`.length);
          const newTagName = `${element.nodeName}-${suffix}`;
          const newElement = createElementWithNewTagName(element, newTagName);
          element.replaceWith(newElement);
        }
      });
    }
  });
}

// Helper function to create a new element with a new tag name and copy attributes and children
function createElementWithNewTagName(element, newTagName) {
  const newElement = document.createElement(newTagName);
  // Copy attributes
  for (const attr of element.attributes) {
    newElement.setAttribute(attr.name, attr.value);
  }
  // Copy child nodes
  while (element.firstChild) {
    newElement.appendChild(element.firstChild);
  }
  return newElement;
}

function itemsFromTest(xmlFragment: DocumentFragment) {
  const items: { identifier: string; href: string; category: string }[] = [];
  xmlFragment.querySelectorAll('qti-assessment-item-ref').forEach(el => {
    const identifier = el.getAttribute('identifier');
    const href = el.getAttribute('href');
    const category = el.getAttribute('category');
    items.push({ identifier, href, category });
  });
  return items;
}

let currentRequest: XMLHttpRequest | null = null;

function loadXML(url, cancelPreviousRequest = true) {
  if (cancelPreviousRequest && currentRequest !== null) {
    currentRequest.abort(); // Abort the ongoing request if there is one
  }

  return new Promise<XMLDocument | null>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    currentRequest = xhr; // Store the current request

    xhr.open('GET', url, true);
    xhr.responseType = 'document';

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseXML);
      } else {
        reject(xhr.statusText);
      }
    };

    xhr.onerror = () => {
      reject(xhr.statusText);
    };

    xhr.send();
  });
}

function parseXML(xmlDocument: string) {
  const parser = new DOMParser();
  const xmlFragment = parser.parseFromString(xmlDocument, 'text/xml');
  return xmlFragment;
}

function toHTML(xmlFragment: Document): DocumentFragment {
  const processor = new XSLTProcessor();
  const xsltDocument = new DOMParser().parseFromString(xmlToHTML, 'text/xml');
  processor.importStylesheet(xsltDocument);
  const itemHTMLFragment = processor.transformToFragment(xmlFragment, document);
  return itemHTMLFragment;
}

function setLocation(xmlFragment: DocumentFragment, location: string) {
  if (!location.endsWith('/')) {
    location += '/';
  }

  xmlFragment.querySelectorAll('[src],[href],[primary-path]').forEach(elWithSrc => {
    let attr: 'src' | 'href' | 'primary-path' | '' = '';

    if (elWithSrc.getAttribute('src')) {
      attr = 'src';
    }
    if (elWithSrc.getAttribute('href')) {
      attr = 'href';
    }
    if (elWithSrc.getAttribute('primary-path')) {
      attr = 'primary-path';
    }
    const attrValue = elWithSrc.getAttribute(attr)?.trim();

    if (!attrValue.startsWith('data:') && !attrValue.startsWith('http')) {
      const newSrcValue = location + encodeURI(attrValue);
      elWithSrc.setAttribute(attr, newSrcValue);
    }
  });
}

function convertCDATAtoComment(xmlFragment: DocumentFragment) {
  const cdataElements = xmlFragment.querySelectorAll('qti-custom-operator[class="js.org"] > qti-base-value');
  cdataElements.forEach(element => {
    const commentText = document.createComment(element.textContent);
    element.replaceChild(commentText, element.firstChild);
  });
}

function stripStyleSheets(xmlFragment: DocumentFragment) {
  // remove qti-stylesheet tag
  xmlFragment.querySelectorAll('qti-stylesheet').forEach(stylesheet => stylesheet.remove());
}
