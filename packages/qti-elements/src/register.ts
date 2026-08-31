import { qtiContentElements } from './elements';

for (const { tag, ctor } of qtiContentElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
