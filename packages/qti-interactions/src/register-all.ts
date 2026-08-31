import { qtiInteractionElements } from './elements';

for (const { tag, ctor } of qtiInteractionElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
