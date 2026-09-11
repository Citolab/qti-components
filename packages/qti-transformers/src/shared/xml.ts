/**
 * Parse XML, reporting a malformed document instead of handing one on.
 *
 * `DOMParser.parseFromString` never throws for `text/xml`: it returns a *document describing the
 * failure*, whose root is an HTML page reading "This page contains the following errors…". Nothing
 * downstream distinguishes that from a real item, so `toHTML` copied the error page into the DOM
 * and the player rendered the browser's parse error as the item — silently, past every try/catch,
 * because nothing ever threw.
 *
 * Leading whitespace and a BOM are stripped first. XML forbids anything before the declaration, so
 * a stray newline in front of `<?xml` is fatal to the letter of the spec — and it is also one of
 * the most common artefacts of an item that has been through an editor, a template or a copy and
 * paste. Accepting it costs nothing and keeps real authoring mistakes visible.
 */
function parseXMLOrThrow(text: string, describeSource: (message: string) => string): XMLDocument {
  const parser = new DOMParser();
  const xmlFragment = parser.parseFromString(text.replace(/^[\s\uFEFF]+/, ''), 'text/xml');

  /*
   * Matched by the error document's own namespace, so an item that legitimately contains an
   * element named `parsererror` cannot be mistaken for a failure. Blink and WebKit put it in the
   * XHTML namespace; Gecko has a namespace of its own.
   */
  const error =
    xmlFragment.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'parsererror')[0] ??
    xmlFragment.getElementsByTagNameNS('http://www.mozilla.org/newlayout/xml/parsererror.xml', 'parsererror')[0];

  if (error) {
    throw new Error(describeSource(error.textContent?.replace(/\s+/g, ' ').trim() || 'malformed XML'));
  }

  return xmlFragment;
}

export function loadXML(url: string, signal?: AbortSignal): Promise<XMLDocument | null> {
  return fetch(url, { signal })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(text => parseXMLOrThrow(text, message => `is not well-formed XML: ${message}`))
    .catch(error => {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw new Error(`Failed to load XML: ${error.message}`);
    });
}

export function parseXML(xmlDocument: string): XMLDocument {
  return parseXMLOrThrow(xmlDocument, message => `Failed to parse XML: ${message}`);
}

// Function to strip unsupported namespaces (qti) from the nodes sent to the browser
function stripNamespaces(node: Node, doc: Document, registry?: CustomElementRegistry): Node {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    let newEl: Element;

    if (
      !el.namespaceURI ||
      el.namespaceURI.startsWith('http://www.imsglobal.org/xsd/qti/') ||
      el.namespaceURI.startsWith('http://www.imsglobal.org/xsd/imsqti')
    ) {
      newEl = registry
        ? doc.createElement(el.localName, { customElementRegistry: registry })
        : doc.createElement(el.localName);
    } else {
      newEl = doc.createElementNS(el.namespaceURI, el.tagName);
    }

    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      newEl.setAttribute(attr.localName, attr.value);
    }
    for (let i = 0; i < el.childNodes.length; i++) {
      newEl.appendChild(stripNamespaces(el.childNodes[i], doc, registry));
    }
    return newEl;
  }
  return node.cloneNode(false);
}

export function toHTML(xmlFragment: Document, registry?: CustomElementRegistry): DocumentFragment {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < xmlFragment.childNodes.length; i++) {
    fragment.appendChild(stripNamespaces(xmlFragment.childNodes[i], document, registry));
  }
  return fragment;
}

// Updates src and href attributes with the base location
// Uses querySelectorAll('*') to find all elements, then checks attributes manually
// This handles namespaced XML documents where attribute selectors like [href] may not work
// Note: primary-path is NOT processed here because it is resolved separately
// by the PCI component using data-base-url in the iframe's module resolution
export function setLocation(xmlFragment: DocumentFragment, location: string) {
  if (!location.endsWith('/')) {
    location += '/';
  }

  // querySelectorAll('*') finds all descendant elements regardless of namespace
  const allElements = xmlFragment.querySelectorAll('*');

  allElements.forEach(el => {
    // Check each attribute we care about
    // src, srcset and poster are URLDType or xs:anyURI everywhere they're used, so we care about them
    // Note: primary-path is excluded - PCI handles module path resolution via data-base-url
    for (const attr of ['src', 'href', 'srcset', 'poster'] as const) {
      const attrValue = el.getAttribute(attr)?.trim();

      if (attrValue && !/^(data:|https?:|blob:)/.test(attrValue)) {
        const newValue = location + encodeURI(attrValue);
        el.setAttribute(attr, newValue);
      }
    }
  });
}
