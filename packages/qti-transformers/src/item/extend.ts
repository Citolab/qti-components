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
