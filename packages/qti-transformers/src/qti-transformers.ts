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

    if (!/^(data:|https?:|blob:)/.test(attrValue)) {
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
