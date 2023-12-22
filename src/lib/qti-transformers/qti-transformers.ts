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

export const qtiTransformItem = (): {
  load: (uri: string) => Promise<typeof api>;
  parse: (xmlString: string) => typeof api;
  path: (location: string) => typeof api;
  html: () => string;
  xml: () => string;
  htmldoc: () => DocumentFragment;
  xmldoc: () => XMLDocument;
} => {
  let xmlFragment: XMLDocument;

  const api = {
    async load(uri: string) {
      return new Promise<typeof api>((resolve, reject) => {
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
    path: (location: string) => {
      setLocation(xmlFragment, location);
      return api;
    },
    pciHooks(uri: string) {
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
              documentPath + '/' + encodeURIComponent(srcValue + (srcValue.endsWith('.js') ? '' : '.js'))
            );
          }
        });
      }
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
export const qtiTransformTest = (): {
  load: (uri: string) => Promise<typeof api>;
  items: () => { identifier: string; href: string; category: string }[];
  html: () => string;
  xml: () => string;
  htmldoc: () => DocumentFragment;
  xmldoc: () => XMLDocument;
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

const xmlToHTML = `
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <!-- convert CDATA to comments -->
  <xsl:template match="text()[contains(., 'CDATA')]">
    <strong>
      <xsl:comment>
        <xsl:value-of select="."/>
      </xsl:comment>
    <strong>
  </xsl:template>

  <!-- remove xml comments -->
  <xsl:template match="comment()" />

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

function loadXML(url) {
  return new Promise<XMLDocument | null>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'document';

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        return resolve(xhr.responseXML);
      } else {
        reject(xhr.statusText);
        return null;
      }
    };

    xhr.onerror = function () {
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
  xmlFragment.querySelectorAll('[src],[href]').forEach(elWithSrc => {
    let attr: 'src' | 'href' | '' = '';

    if (elWithSrc.getAttribute('src')) {
      attr = 'src';
    }
    if (elWithSrc.getAttribute('href')) {
      attr = 'href';
    }
    const attrValue = elWithSrc.getAttribute(attr)?.trim();

    if (!attrValue.startsWith('data:') && !attrValue.startsWith('http')) {
      const newSrcValue = location + encodeURI(attrValue);
      elWithSrc.setAttribute(attr, newSrcValue);
    }
  });
}
