import { qtiProcessingElements } from './elements';

for (const { tag, ctor } of qtiProcessingElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
