// Function to extend elements with a specific tag name by adding an extension suffix
// Uses localName matching to handle namespaced XML documents where querySelectorAll may not work
export function extendElementName(xmlFragment: XMLDocument, tagName: string, extension: string) {
  // Use getElementsByTagName with '*' to find all elements, then filter by localName
  // This works correctly for both namespaced and non-namespaced XML documents
  const allElements = Array.from(xmlFragment.getElementsByTagName('*'));
  const matchingElements = allElements.filter(
    element => element.localName === tagName || element.localName?.toLowerCase() === tagName.toLowerCase()
  );

  matchingElements.forEach(element => {
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
function createElementWithNewTagName(element: Element, newTagName: string) {
  // create Elements on the ownerDocument which is usually the XMLDocument
  const newElement = element.ownerDocument.createElement(newTagName);
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

// let currentRequest: XMLHttpRequest | null = null;

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

function stripNamespaces(node: Node, doc: Document): Node {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const newEl = doc.createElement(el.localName);
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
    // Note: primary-path is excluded - PCI handles module path resolution via data-base-url
    for (const attr of ['src', 'href'] as const) {
      const attrValue = el.getAttribute(attr)?.trim();

      if (attrValue && !/^(data:|https?:|blob:)/.test(attrValue)) {
        const newValue = location + encodeURI(attrValue);
        el.setAttribute(attr, newValue);
      }
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

export function getShuffleQuerySelectorByTagName(tagName: string): string | string[] | null {
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
      return null;
  }
}
