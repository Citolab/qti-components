import { css } from 'lit';

import { correctionPart } from '@qti-components/base';

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
    display: inline-block;
    vertical-align: baseline;
    position: relative;
    --qti-inline-choice-width: 0;
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
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    box-sizing: border-box;
    min-width: var(--qti-inline-choice-width);
    anchor-name: --qti-inline-choice-trigger;
  }

  [part='value'] {
    flex: 1 1 auto;
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
    transition: transform 150ms ease;
    transform-origin: center;
  }

  [part~='dropdown-icon-open'] {
    transform: rotate(180deg);
  }

  /* ── Popover menu — anchor positioning only, all paint in the theme ──────── */
  [part='menu'] {
    position-anchor: --qti-inline-choice-trigger;
    inset: auto;
    margin: 0;
    z-index: 1000;
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
    top: 100%;
    left: 0;
    z-index: 1;
    white-space: nowrap;
  }

  /* ── Correct-option answer key overlay ──────────────────────────────────── */
  [part='correct-option'] {
    display: inline-block;
    margin: 0 0.25rem;
  }
`;

const styles: CSSResultGroup = [correctionPart, own];

export default styles;
