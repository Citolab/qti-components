import { elements } from './elements';

for (const { tag, ctor } of elements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
