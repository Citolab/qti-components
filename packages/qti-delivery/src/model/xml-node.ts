/**
 * The part of a DOM element that `delivery` reads: a browser `Element` and an `@xmldom/xmldom`
 * element both satisfy it, so the same code builds the model in the browser and under Node. Only
 * attributes and child elements, never upgraded properties, so nothing depends on a custom element
 * being registered.
 */
export interface XmlElement {
  readonly nodeType: number;
  readonly localName: string | null;
  readonly childNodes: ArrayLike<XmlNode>;
  /** Null when the attribute is absent, in the browser and in xmldom alike. */
  getAttribute(name: string): string | null;
}

export interface XmlNode {
  readonly nodeType: number;
}

const ELEMENT_NODE = 1;

/** The child elements of `parent` with one of the given local names, in document order. */
export function childElements(parent: XmlElement, ...localNames: string[]): XmlElement[] {
  const nodes = parent.childNodes;
  const children: XmlElement[] = [];
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.nodeType === ELEMENT_NODE && localNames.includes((node as XmlElement).localName ?? '')) {
      children.push(node as XmlElement);
    }
  }
  return children;
}

/** The first child element with the given local name, or null. */
export const childElement = (parent: XmlElement, localName: string): XmlElement | null =>
  childElements(parent, localName)[0] ?? null;

/** An `xs:boolean` attribute: `true`/`1` and `false`/`0`; anything else, or absent, is undefined. */
export function booleanAttribute(element: XmlElement, name: string): boolean | undefined {
  const value = element.getAttribute(name)?.trim();
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
}

/** An `xs:int` attribute, or undefined when absent or not an integer. */
export function integerAttribute(element: XmlElement, name: string): number | undefined {
  const value = element.getAttribute(name)?.trim();
  return value && /^[+-]?\d+$/.test(value) ? Number(value) : undefined;
}
