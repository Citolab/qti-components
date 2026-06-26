import { css } from 'lit';

/**
 * Shadow-DOM styles for the tabular layout of qti-match-interaction
 * (class="qti-match-tabular"). The two qti-simple-match-set children are
 * slotted into named slots and participate in a CSS grid as light-DOM
 * row/column headers via display: contents. Drag-drop mode is untouched.
 */
export default css`
  :host(.qti-match-tabular) slot:not([hidden]) {
    display: contents;
  }
  :host(.qti-match-tabular) [part='grid'] {
    display: grid;
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
  :host(.qti-match-tabular) ::slotted(qti-simple-match-set[slot='match-rows']),
  :host(.qti-match-tabular) ::slotted(qti-simple-match-set[slot='match-cols']) {
    display: contents;
  }
`;
