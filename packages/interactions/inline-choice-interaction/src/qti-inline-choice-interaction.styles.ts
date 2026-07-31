import { css } from 'lit';

import type { CSSResultGroup } from 'lit';

const own = css`
  /* ── Host ──────────────────────────────────────────────────────────────────
     Inline-block so the element flows with surrounding text.
     --qti-inline-choice-width is the single width control surface:
       0 (default) → trigger sizes to its content
       set by qti-input-width-* classes → trigger has a character-count minimum
       set by autosizing JS (inlineChoiceAutosize) → trigger matches widest option
  */
  :host {
    /*
     * The menu anchors to the HOST, not to the trigger inside it.
     *
     * The host is the box that paints the field border (@mixin field in the theme); the trigger is
     * transparent and border-less and therefore sits one border-width in on every side. Anchoring to
     * the trigger lined the menu up with that inner box, so the open control was 1px narrower than
     * the closed one on each side — measured: host 96.38→465.80, menu 97.38→464.80. Anchoring to the
     * host lines the menu up with the edge you can actually see.
     */
    anchor-name: --qti-inline-choice-anchor;

    display: inline-flex;
    align-items: center;
    vertical-align: baseline;
    position: relative;
    --qti-inline-choice-width: 0;
    /*
     * Four component-local tokens used to sit here and all four are gone.
     *
     * Three were pure aliases — --qti-inline-choice-overlay-z-index, -popover-z-index and
     * -motion-duration-fast each held nothing but var() of the global token of the same meaning,
     * were read exactly once, and were reachable from nowhere else. A second name for one value is
     * not an override surface; a theme retunes --qti-overlay-z-index and every reader follows.
     *
     * The fourth, --qti-inline-choice-trigger-gap, was calc(var(--qti-gap) / 2) — the arithmetic
     * the spacing vocabulary explicitly rules out: "a call site that needs half of a gap is
     * describing a fourth value that does not exist in the vocabulary, and the answer is to pick the
     * nearest of the three, not to do arithmetic" (qti-variables.css). The nearest is --qti-gap,
     * which is what the trigger spends now.
     */
  }

  /* ── QTI mandatory input-width shared vocabulary (16 values) ─────────────── */
  :host(.qti-input-width-1) {
    --qti-inline-choice-width: 1ch;
  }
  :host(.qti-input-width-2) {
    --qti-inline-choice-width: 2ch;
  }
  :host(.qti-input-width-3) {
    --qti-inline-choice-width: 3ch;
  }
  :host(.qti-input-width-4) {
    --qti-inline-choice-width: 4ch;
  }
  :host(.qti-input-width-5) {
    --qti-inline-choice-width: 5ch;
  }
  :host(.qti-input-width-6) {
    --qti-inline-choice-width: 6ch;
  }
  :host(.qti-input-width-10) {
    --qti-inline-choice-width: 10ch;
  }
  :host(.qti-input-width-15) {
    --qti-inline-choice-width: 15ch;
  }
  :host(.qti-input-width-20) {
    --qti-inline-choice-width: 20ch;
  }
  :host(.qti-input-width-25) {
    --qti-inline-choice-width: 25ch;
  }
  :host(.qti-input-width-30) {
    --qti-inline-choice-width: 30ch;
  }
  :host(.qti-input-width-35) {
    --qti-inline-choice-width: 35ch;
  }
  :host(.qti-input-width-40) {
    --qti-inline-choice-width: 40ch;
  }
  :host(.qti-input-width-45) {
    --qti-inline-choice-width: 45ch;
  }
  :host(.qti-input-width-50) {
    --qti-inline-choice-width: 50ch;
  }
  :host(.qti-input-width-72) {
    --qti-inline-choice-width: 72ch;
  }

  /* ── Trigger button — layout only, all paint lives in the theme ───────────── */
  button[part='trigger'] {
    display: inline-grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: var(--qti-glyph-gap);
    box-sizing: border-box;
    min-width: var(--qti-inline-choice-width);
    vertical-align: baseline;
  }

  [part='value'] {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  /* ── Chevron icon ─────────────────────────────────────────────────────────────
     Rendered as a CSS mask so the theme controls its colour via color:.
     The span in the template is empty; this CSS provides the visual.
  */
  [part~='dropdown-icon'] {
    flex: 0 0 auto;
    display: inline-block;
    width: 1em;
    height: 1em;
    background-color: currentColor;
    mask: var(--qti-chevron-mask) no-repeat center / contain;
    -webkit-mask: var(--qti-chevron-mask) no-repeat center / contain;
    transition: transform var(--qti-motion-duration-fast) ease;
    transform-origin: center;
  }

  [part~='dropdown-icon-open'] {
    transform: rotate(180deg);
  }

  /* ── Popover menu — anchor positioning only, all paint in the theme ──────── */
  [part='menu'] {
    position-anchor: --qti-inline-choice-anchor;
    inset: auto;
    margin: 0;
    z-index: var(--qti-popover-z-index);
    top: anchor(bottom);
    left: anchor(left);
    min-width: anchor-size(width);
    max-width: min(90vw, 36rem);
    max-height: min(40vh, 20rem);
    overflow: auto;
    box-sizing: border-box;
    position-try-fallbacks: flip-block, flip-inline;
  }

  /* ── Option rows — layout only, all paint in the theme ─────────────────── */
  button[part~='option'] {
    display: flex;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    text-align: left;
    font: inherit;
    color: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  [part='option-content'] {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  img {
    display: inline-block;
    vertical-align: middle;
  }

  /* ── Validation message ────────────────────────────────────────────────────
     Absolutely positioned below the trigger so it does not push surrounding
     inline text and cannot be obscured by the open popover menu.
  */
  [part='message'] {
    position: absolute;
    inset-block-start: 100%;
    inset-inline-start: 0;
    z-index: var(--qti-overlay-z-index);
    white-space: nowrap;
  }
`;

const styles: CSSResultGroup = own;

export default styles;
