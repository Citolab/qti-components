import type { XmlElement, XmlNode } from '@qti-components/delivery';

/**
 * A rendered test element read back as its QTI markup, for `@qti-components/delivery`. Our
 * `qti-assessment-test`, `qti-test-part` and `qti-assessment-section` move `title` to `data-title`
 * when they upgrade (no browser tooltip), so `title` falls back to that; every other attribute is
 * read as it is.
 */
export function renderedMarkup(element: Element): XmlElement {
  return {
    nodeType: element.nodeType,
    localName: element.localName,
    get childNodes(): XmlNode[] {
      return Array.from(element.children, renderedMarkup);
    },
    getAttribute: (name: string) =>
      element.getAttribute(name) ?? (name === 'title' ? element.getAttribute('data-title') : null)
  };
}
