/**
 * Pairs every `:state(x)` with a `[data-state~='x']` arm.
 *
 * Safari 16.4–17.3 and pre-spec-change Chrome/Edge cannot service custom states
 * (see `packages/qti-base/src/utils/custom-state-set.ts`), and their CSS parsers
 * drop any selector list containing `:state()` outright — so on those browsers
 * checked, correct-response and drag styling simply never rendered. The shim in
 * qti-base mirrors states into a space-separated `data-state` attribute on the
 * host; this plugin is what makes the stylesheets read it.
 *
 *   qti-simple-choice:state(checked)
 *   → qti-simple-choice:is(:state(checked), [data-state~='checked'])
 *
 * `:is()` is what keeps this working in both directions: its parsing is
 * forgiving, so a browser that does not understand `:state()` discards that arm
 * and keeps the attribute arm, while a browser that does keeps matching the
 * state arm. The two are mutually exclusive in practice — `data-state` is only
 * ever written by the shim, which is only installed where `:state()` is broken.
 *
 * A `:state()` after a pseudo-element (`a::part(drag):state(candidate-correct)`)
 * is left exactly as written and gets no fallback: an attribute selector may not
 * follow a pseudo-element, and `data-state` lives on the host, not on the part,
 * so there is nothing for an attribute arm to read anyway. Those selectors work
 * only where `:state()` does. (Pairing them, as this plugin once did, happened to
 * work too — current Chromium, WebKit and Firefox parse `:is()` forgivingly and
 * discard the invalid arm — but it relied on that and emitted selectors no
 * browser can fully use.)
 *
 * Left bare, such a selector is unparseable where `:state()` is unknown (Chrome
 * 120 drops `a::part(drag):state(x)`), and one unparseable selector drops a whole
 * selector list. So a rule whose list mixes both kinds is split in two, the
 * post-pseudo-element selectors moved into a copy right after it; otherwise those
 * browsers would lose the fallback arms of their neighbours along with them. Same
 * declarations, same layer, same per-selector specificity, adjacent: the cascade
 * does not change. tools/testing/legacy covers the old-browser side.
 *
 * Applied at build time rather than written into the sources, because the theme
 * carries ~250 `:state()` selectors: doing it here keeps them readable, cannot
 * corrupt the many `:state(...)` mentions inside comments, and covers selectors
 * added later without anyone having to remember.
 *
 * Runs after postcss-import, so it sees the interaction files the theme entry
 * points pull in, and before autoprefixer.
 */

/** `:state(` … `)` with no nested parens — state names are plain idents. */
const STATE_SELECTOR = /:state\(\s*([^()\s]+)\s*\)/g;

const withFallback = selector =>
  selector.replace(STATE_SELECTOR, (_match, name) => `:is(:state(${name}), [data-state~='${name}'])`);

/** A `:state()` after a pseudo-element, which cannot carry the fallback. */
const hasStateAfterPseudoElement = selector => {
  const pseudo = selector.indexOf('::');
  return pseudo !== -1 && selector.includes(':state(', pseudo);
};

/**
 * Pairs the states of one complex selector that come before its first
 * pseudo-element; whatever follows it is left as written.
 */
const pairSelector = selector => {
  // Already carries the fallback, so the transform is idempotent and a
  // hand-written pairing is left alone.
  if (selector.includes('[data-state~=')) return selector;

  const pseudo = selector.indexOf('::');
  if (pseudo === -1) return withFallback(selector);
  return withFallback(selector.slice(0, pseudo)) + selector.slice(pseudo);
};

/** @type {import('postcss').PluginCreator<void>} */
const plugin = () => ({
  postcssPlugin: 'qti-custom-state-fallback',
  Rule(rule) {
    if (!rule.selector.includes(':state(')) return;

    // `rule.selectors` splits on top-level commas only, so `:is(a, b)` stays whole.
    const selectors = rule.selectors;
    const afterPseudo = selectors.filter(hasStateAfterPseudoElement);
    const rest = selectors.filter(selector => !hasStateAfterPseudoElement(selector));

    if (afterPseudo.length > 0 && rest.length > 0) {
      const split = rule.cloneAfter({ selectors: afterPseudo });
      split.raws.before = rule.raws.before || '\n';
      rule.selectors = rest;
    }

    const current = rule.selectors;
    const paired = current.map(pairSelector);
    if (paired.some((selector, index) => selector !== current[index])) rule.selectors = paired;
  }
});

plugin.postcss = true;

export default plugin;
export { withFallback };
