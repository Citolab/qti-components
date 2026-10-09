import { ttsElements } from './elements';

for (const { tag, ctor } of ttsElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
