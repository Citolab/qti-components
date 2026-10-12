import { viewElements } from './elements';

const taken = viewElements.filter(({ tag, ctor }) => {
  const existing = customElements.get(tag);
  return existing !== undefined && existing !== ctor;
});

if (taken.length > 0) {
  console.warn(
    `[@qti-components/test/view] ${taken.length} tag(s) were already registered by something else, ` +
      `so the view controls versions of them are inactive: ${taken.map(({ tag }) => tag).join(', ')}.`
  );
}

for (const { tag, ctor } of viewElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
