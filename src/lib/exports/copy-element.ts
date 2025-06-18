import { LitElement } from 'lit';

export function copyElement(element: LitElement): LitElement {
  const clone = document.createElement(element.tagName.toLowerCase()) as LitElement;

  for (const attr of element.attributes) {
    clone.setAttribute(attr.name, attr.value);
  }
  element.childNodes.forEach(child => {
    const childClone = child instanceof LitElement && child.tagName ? copyElement(child as LitElement) : child.cloneNode(true);
    clone.appendChild(childClone);
  });

  return clone;
}
