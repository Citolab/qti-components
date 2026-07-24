/**
 * Stylelint exists here for one rule.
 *
 * `qti/no-layout-in-transient-state` enforces the invariant that a transient state may repaint an
 * element but never resize or move it. Breaking it produces bugs no other check in this repo can
 * see: VRT compares end states, and the end state looks right; the conformance suite reports a
 * wrong response without saying why. What actually happened is that a chip changed size mid-drag
 * and the drop target reflowed out from under the pointer. That was `border: none` on a drag
 * placeholder, in a rule whose own comment claimed it kept the chip's footprint.
 *
 * drag-drop.invariance.spec.ts measures the same invariant from the other side, at runtime.
 */
export default {
  plugins: ['./tools/stylelint/no-layout-in-transient-state.mjs'],
  rules: {
    /*
     * No allowlist any more.
     *
     * `ignoreStates: ['checked', 'correct-response']` used to sit here, switching the rule off for
     * every rule naming either state anywhere in the repo, in order to permit a handful. All of it
     * is now paid off:
     *
     *   checked            hottext reserved its selected padding unselected, so choosing a word no
     *                      longer reflows the sentence around it.
     *   correct-response   choice's answer key draws its thicker edge as an inset shadow and
     *                      reserves the tick's room in the base rule, instead of growing the choice
     *                      by 2px of border and 30px of padding when the key is revealed.
     *
     * What is left of the old list — the answer-key rules under `.full-correct-response` — is
     * exempt in the rule itself, and for a reason rather than by name: that wrapper is built once
     * around a clone and never toggles, so nothing it sizes can reflow under a cursor.
     */
    'qti/no-layout-in-transient-state': true
  },
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss'
    },
    {
      /*
       * The theme is spacing, sizing and paint. Layout belongs to the .styles.ts beside each
       * component, which is where the box actually lives.
       *
       * This is scoped rather than global because the two rules disagree on purpose. In a transient
       * state, padding and width *are* layout — toggling them reflows the page. In the theme they
       * are the point. So `no-layout-in-transient-state` forbids padding and permits `display`,
       * while this one does the reverse.
       */
      files: ['packages/qti-theme/src/styles/qti-theme/**/*.css'],
      plugins: ['./tools/stylelint/no-layout-in-theme.mjs'],
      rules: {
        'qti/no-layout-in-theme': true
      }
    }
  ],
  ignoreFiles: ['**/dist/**', '**/node_modules/**', '**/cdn/**']
};
