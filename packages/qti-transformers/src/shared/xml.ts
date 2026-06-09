export function loadXML(url: string, signal?: AbortSignal): Promise<XMLDocument | null> {
  return fetch(url, { signal })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      const parser = new DOMParser();
      return parser.parseFromString(text, 'text/xml');
    })
    .catch(error => {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw new Error(`Failed to load XML: ${error.message}`);
    });
}

export function parseXML(xmlDocument: string) {
  const parser = new DOMParser();
  const xmlFragment = parser.parseFromString(xmlDocument, 'text/xml');
  return xmlFragment;
}

// Function to strip unsupported namespaces (qti) from the nodes sent to the browser
function stripNamespaces(node: Node, doc: Document): Node {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    let newEl: Element;

    if (
      !el.namespaceURI ||
      el.namespaceURI.startsWith('http://www.imsglobal.org/xsd/qti/') ||
      el.namespaceURI.startsWith('http://www.imsglobal.org/xsd/imsqti')
    ) {
      newEl = doc.createElement(el.localName);
    } else {
      newEl = doc.createElementNS(el.namespaceURI, el.tagName);
    }

    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      newEl.setAttribute(attr.localName, attr.value);
    }
    for (let i = 0; i < el.childNodes.length; i++) {
      newEl.appendChild(stripNamespaces(el.childNodes[i], doc));
    }
    return newEl;
  }
  return node.cloneNode(false);
}

export function toHTML(xmlFragment: Document): DocumentFragment {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < xmlFragment.childNodes.length; i++) {
    fragment.appendChild(stripNamespaces(xmlFragment.childNodes[i], document));
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
