import { qtiExtendedElements } from './elements.js';

for (const { tag, ctor } of qtiExtendedElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
