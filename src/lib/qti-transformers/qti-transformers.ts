const xml = String.raw;

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
export function extendElementName(xmlFragment: XMLDocument, tagName: string, extension: string) {
  xmlFragment.querySelectorAll(tagName).forEach(element => {
    const newTagName = `${tagName}-${extension}`;
    const newElement = createElementWithNewTagName(element, newTagName);
    element.replaceWith(newElement);
  });
}

// Function to extend any element with a specific class pattern (e.g., "extend:suffix")
export function extendElementsWithClass(xmlFragment: XMLDocument, classNamePattern: string) {
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

export function itemsFromTest(xmlFragment: DocumentFragment) {
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

export function loadXML(url, cancelPreviousRequest = false) {
  // console.trace('loadXML', url);
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

export function parseXML(xmlDocument: string) {
  const parser = new DOMParser();
  const xmlFragment = parser.parseFromString(xmlDocument, 'text/xml');
  return xmlFragment;
}

export function toHTML(xmlFragment: Document): DocumentFragment {
  const processor = new XSLTProcessor();
  const xsltDocument = new DOMParser().parseFromString(xmlToHTML, 'text/xml');
  processor.importStylesheet(xsltDocument);
  const itemHTMLFragment = processor.transformToFragment(xmlFragment, document);
  return itemHTMLFragment;
}

export function setLocation(xmlFragment: DocumentFragment, location: string) {
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

export function convertCDATAtoComment(xmlFragment: DocumentFragment) {
  const cdataElements = xmlFragment.querySelectorAll('qti-custom-operator[class="js.org"] > qti-base-value');
  cdataElements.forEach(element => {
    const commentText = document.createComment(element.textContent);
    element.replaceChild(commentText, element.firstChild);
  });
}

export function stripStyleSheets(xmlFragment: DocumentFragment) {
  // remove qti-stylesheet tag
  xmlFragment.querySelectorAll('qti-stylesheet').forEach(stylesheet => stylesheet.remove());
}

export function getShuffleQuerySelectorByTagName(tagName: string) {
  switch (tagName) {
    case 'qti-choice-interaction':
    case 'qti-order-interaction':
      return 'qti-simple-choice';
    case 'qti-inline-choice-interaction':
      return 'qti-inline-choice';
    case 'qti-match-interaction':
      return [
        'qti-simple-match-set:first-of-type qti-simple-associable-choice',
        'qti-simple-match-set:last-of-type > qti-simple-associable-choice'
      ];
    case 'qti-gap-match-interaction':
      return 'qti-gap-text';
    case 'qti-associate-interaction':
      return 'qti-simple-associable-choice';
    default:
  }
}
