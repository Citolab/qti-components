import { css } from 'lit';

import { correctionPart } from '@qti-components/base';

import type { CSSResultGroup } from 'lit';

const own = css`
  :host {
    display: inline-block;
    vertical-align: baseline;
    position: relative;
    /* Set by qti-input-width-* classes or by autosizing JS.
       When unset (0) the trigger sizes purely to its content. */
    --qti-inline-choice-width: 0;
  }

  /* ── QTI mandatory input-width shared vocabulary ──────────────────────────
     Each class maps to an approximate character-count width using the 'ch'
     unit (width of '0' in the current font). qti-input-width-72 fills the
     full available width to represent a tablet-wide control.
     ──────────────────────────────────────────────────────────────────────── */
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
    --qti-inline-choice-width: 100%;
  }

  button[part='trigger'] {
    anchor-name: --qti-inline-choice-trigger;
    min-width: var(--qti-inline-choice-width);
  }

  [part='value'] {
    display: inline-flex;
    align-items: center;
  }

  [part='menu'] {
    position-anchor: --qti-inline-choice-trigger;
    inset: auto;
    margin: 0;
    z-index: 1000;
    top: calc(anchor(bottom));
    left: anchor(left);
    min-width: anchor-size(width);
    position-try-fallbacks: flip-block, flip-inline;
  }

  button[part~='option'] {
    width: 100%;
  }

  [part='option-content'] {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  button[part~='option'] img,
  button[part='trigger'] img,
  [part='menu'] img {
    display: inline-block;
    vertical-align: middle;
  }
`;

const styles: CSSResultGroup = [correctionPart, own];

export default styles;
