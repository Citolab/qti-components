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
    'qti/no-layout-in-transient-state': [
      true,
      {
        /*
         * Known debt, not exemptions.
         *
         * `candidate-correct` and `candidate-incorrect` came OFF this list once the correction
         * badge moved into its own `part="correction"`. What kept them here was the badge: four
         * `::after` blocks setting `margin-left` and `width`, plus a `border` shorthand where a
         * `border-color` was meant. Both are gone; the rule now polices them.
         *
         * What remains:
         *
         *   checked             kennisnet gives a selected hottext padding and margin, so choosing
         *                       a word reflows the sentence around it; it also resizes the radio
         *                       control, so a choice list shifts as it is answered.
         *   candidate-correct   both add a `border` shorthand where the element may not have had
         *   candidate-incorrect one, growing it when feedback is revealed.
         *   correct-response    adds `border` and `padding-right`.
         *
         * Each needs checking against VRT before it moves, so they are named here rather than
         * silently disabled at 23 call sites. Deleting a name from this list is the unit of work.
         */
        ignoreStates: ['checked', 'correct-response']
      }
    ]
  },
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss'
    }
  ],
  ignoreFiles: ['**/dist/**', '**/node_modules/**', '**/cdn/**']
};
