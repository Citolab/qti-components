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

/** @type {import('postcss').PluginCreator<void>} */
const plugin = () => ({
  postcssPlugin: 'qti-custom-state-fallback',
  Rule(rule) {
    if (!rule.selector.includes(':state(')) return;

    // Skip a selector that already carries the fallback, so the transform is
    // idempotent and a hand-written pairing is left alone.
    if (rule.selector.includes('[data-state~=')) return;

    const next = withFallback(rule.selector);
    if (next !== rule.selector) rule.selector = next;
  }
});

plugin.postcss = true;

export default plugin;
export { withFallback };
