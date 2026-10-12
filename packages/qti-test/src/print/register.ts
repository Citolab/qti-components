import { printElements } from './elements';

const taken = printElements.filter(({ tag, ctor }) => {
  const existing = customElements.get(tag);
  return existing !== undefined && existing !== ctor;
});

if (taken.length > 0) {
  console.warn(
    `[@qti-components/test/print] ${taken.length} tag(s) were already registered by something else, ` +
      `so the print helpers versions of them are inactive: ${taken.map(({ tag }) => tag).join(', ')}.`
  );
}

for (const { tag, ctor } of printElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
