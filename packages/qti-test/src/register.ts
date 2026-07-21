import { qtiTestElements } from './elements';

for (const { tag, ctor } of qtiTestElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
