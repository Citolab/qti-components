import { qtiInteractionCoreElements } from './elements';

for (const { tag, ctor } of qtiInteractionCoreElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
