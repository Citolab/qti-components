import { qtiItemElements } from './elements';

for (const { tag, ctor } of qtiItemElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
