export const qtiTransformItem = () => {
  let xmlFragment: DocumentFragment;

  const api = {
    async load(uri) {
      return new Promise<typeof api>((resolve, reject) => {
        loadXML(uri).then(xml => {
          xmlFragment = xml;
          return resolve(api);
        });
      });
    },
    parse(xmlString) {
      xmlFragment = parseXML(xmlString);
      return api;
    },
    path: (location: string) => {
      setLocation(xmlFragment, location);
      return api;
    },
    html() {
      return toHTML(xmlFragment);
    },
    xml(): string {
      return new XMLSerializer().serializeToString(xmlFragment);
    }
  };
  return api;
};

export const qtiTransformTest = () => {
  let xmlFragment: DocumentFragment;

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
      return toHTML(xmlFragment);
    },
    xml(): string {
      return new XMLSerializer().serializeToString(xmlFragment);
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
  return new Promise<DocumentFragment | null>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'document';

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // const docFragment = document.createDocumentFragment();
        // docFragment.appendChild(xhr.responseXML);
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

function toHTML(xmlFragment: DocumentFragment) {
  const processor = new XSLTProcessor();
  const xsltDocument = new DOMParser().parseFromString(xmlToHTML, 'text/xml');
  processor.importStylesheet(xsltDocument);
  const itemHTMLFragment = processor.transformToFragment(xmlFragment, document);
  const itemHTML = new XMLSerializer().serializeToString(itemHTMLFragment);
  return itemHTML;
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
      const newSrcValue = location + encodeURIComponent(attrValue);
      elWithSrc.setAttribute(attr, newSrcValue);
    }
  });
}
