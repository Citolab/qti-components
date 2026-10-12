import { scoringElements } from './elements';

const taken = scoringElements.filter(({ tag, ctor }) => {
  const existing = customElements.get(tag);
  return existing !== undefined && existing !== ctor;
});

if (taken.length > 0) {
  console.warn(
    `[@qti-components/test/scoring] ${taken.length} tag(s) were already registered by something else, ` +
      `so the scoring controls versions of them are inactive: ${taken.map(({ tag }) => tag).join(', ')}.`
  );
}

for (const { tag, ctor } of scoringElements) {
  if (!customElements.get(tag)) {
    customElements.define(tag, ctor);
  }
}
