import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

/**
 * Shadow-DOM styles for the tabular layout of qti-match-interaction
 * (class="qti-match-tabular"). The two qti-simple-match-set children are
 * slotted into named slots and participate in a CSS grid as light-DOM
 * row/column headers via display: contents. Drag-drop mode is untouched.
 */
export default [
  boxSizing,
  css`
    :host(.qti-match-tabular) slot:not([hidden]) {
      display: contents;
    }
    /*
     * Each cell's radio or checkbox is a real input, visually hidden over the whole cell: it takes
     * Tab focus, the arrow keys move within a row's radio group and Space toggles a checkbox, all
     * natively. It was the hidden attribute, which took it out of the tab order, so the grid could not be
     * answered from a keyboard at all. The span beside it draws the control; the theme rings the
     * cell (::part(input-cell):focus-within).
     */
    :host(.qti-match-tabular) [part~='input-cell'] {
      position: relative;
    }
    :host(.qti-match-tabular) [part~='input-cell'] > input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      cursor: pointer;
    }
    :host(.qti-match-tabular) [part='grid'] {
      display: grid;
      /* Clips the cell rules — which are the grid's own background showing through a 1px gap — to the
         theme's border-radius. */
      overflow: hidden;
      width: fit-content;
      max-width: 100%;
      grid-template-columns: minmax(min-content, max-content) repeat(var(--qti-match-cols, 1), auto);
      grid-template-rows: auto repeat(var(--qti-match-rows, 1), auto);
    }
    /* Subgrid wrappers carry the slotted choices and the input cells into the
     outer grid's tracks. This structure is shared with the editor's tabular
     template so both can inherit the same theme CSS. No per-choice inline
     style writes are needed — auto-flow + subgrid handle placement. */
    :host(.qti-match-tabular) [part='cols-wrap'] {
      grid-column: 2 / -1;
      grid-row: 1;
      display: grid;
      grid-template-columns: subgrid;
    }
    :host(.qti-match-tabular) [part='rows-wrap'] {
      grid-column: 1;
      grid-row: 2 / -1;
      display: grid;
      grid-template-rows: subgrid;
    }
    :host(.qti-match-tabular) [part='checkbox-grid'] {
      grid-column: 2 / -1;
      grid-row: 2 / -1;
      display: grid;
      grid-template-columns: subgrid;
      grid-template-rows: subgrid;
    }
    :host(.qti-match-tabular) ::slotted(qti-simple-match-set) {
      display: contents;
    }

    /*
     * The radio/checkbox box centres its own mark. qti-simple-choice.styles.ts does the same for
     * the non-tabular control; here the cells are plain spans in this shadow root, so the rule
     * belongs to this file.
     *
     * The theme's 'form' mixin used to carry 'display: grid; place-content: center', which centred
     * both — from a document stylesheet, overriding qti-simple-choice's own flex centring. The mixin
     * keeps the box's size and paint; the box itself is laid out here.
     */
    :host(.qti-match-tabular) [part~='control'] {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  `
];
