import { qtiBaseElements } from './elements';

for (const { tag, ctor } of qtiBaseElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
