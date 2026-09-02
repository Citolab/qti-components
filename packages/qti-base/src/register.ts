import { qtiBaseElements } from './elements';
import { installCustomStateSetFallback } from './utils/custom-state-set';

// Before any element is defined, so the patched `attachInternals` is in place by
// the time the first interaction upgrades. No-op where `states` works natively.
installCustomStateSetFallback();

for (const { tag, ctor } of qtiBaseElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
