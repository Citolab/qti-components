import { describe, expect, it } from 'vitest';

import { qtiCorrectionElements } from '@qti-components/corrections/elements';
import { qtiInteractionElements } from '@qti-components/interactions/elements';

/**
 * The correction entry point has to win the race for its tags, and the way it loses is silent.
 *
 * Every `register.ts` in the workspace guards with `if (!customElements.get(tag))`, so if the
 * standard constructors reach the global registry first the correction variants are skipped
 * without an error — the page renders, and simply never shows a correct answer. Code splitting is
 * what would cause that: if tsup ever puts one of the element-registering `register.js` modules
 * into a chunk that `dist/corrections.js` imports, the standard set evaluates first and this
 * entry is dead on arrival.
 *
 * Importing the module for its side effect is the whole test. It runs in its own browser context,
 * so the global registry it mutates is not shared with other spec files.
 */
import './corrections';

describe('@citolab/qti-components/corrections', () => {
  it('registers the correction constructor for every tag it overrides', () => {
    const wrong = qtiCorrectionElements.filter(({ tag, ctor }) => customElements.get(tag) !== ctor);

    expect(wrong.map(({ tag }) => tag)).toEqual([]);
  });

  it('registers the standard constructor for interactions that have no correction variant', () => {
    const overridden = new Set<string>(qtiCorrectionElements.map(({ tag }) => tag));
    const untouched = qtiInteractionElements.filter(({ tag }) => !overridden.has(tag));

    // Guards the assertion itself: if corrections ever covered every interaction this would
    // pass vacuously.
    expect(untouched.length).toBeGreaterThan(0);

    const wrong = untouched.filter(({ tag, ctor }) => customElements.get(tag) !== ctor);
    expect(wrong.map(({ tag }) => tag)).toEqual([]);
  });
});
