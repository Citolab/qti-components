import { stampElements } from './elements';

const taken = stampElements.filter(({ tag, ctor }) => {
  const existing = customElements.get(tag);
  return existing !== undefined && existing !== ctor;
});

if (taken.length > 0) {
  console.warn(
    `[@qti-components/test/stamp] ${taken.length} tag(s) were already registered by something else, ` +
      `so the stamp versions of them are inactive: ${taken.map(({ tag }) => tag).join(', ')}.`
  );
}

for (const { tag, ctor } of stampElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
