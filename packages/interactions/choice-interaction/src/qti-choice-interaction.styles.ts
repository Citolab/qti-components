import { css } from 'lit';

import { boxSizing, validationMessage } from '@qti-components/base';

export default [
  boxSizing,
  validationMessage,
  css`
    :host {
      display: block;
    }

    [part='slot'] {
      display: grid;
      gap: 10px;
    }

    /* Define the number of columns dynamically */
    :host([class*='qti-choices-stacking-']) [part='slot'] {
      grid-template-columns: repeat(var(--stacking-count, 1), 1fr);
    }

    /* Apply dynamic stacking count based on class */
    :host(.qti-choices-stacking-1) {
      --stacking-count: 1;
    }
    :host(.qti-choices-stacking-2) {
      --stacking-count: 2;
    }
    :host(.qti-choices-stacking-3) {
      --stacking-count: 3;
    }
    :host(.qti-choices-stacking-4) {
      --stacking-count: 4;
    }
    :host(.qti-choices-stacking-5) {
      --stacking-count: 5;
    }

    /* Default slot item layout */
    ::slotted(qti-simple-choice) {
      display: flex;
      align-items: center;
      white-space: normal;
    }

    /* Orientation styles */
    :host(.qti-orientation-horizontal) [part='slot'] {
      grid-auto-flow: dense column;
      grid-auto-columns: 1fr;
    }

    :host(.qti-orientation-vertical) [part='slot'] {
      grid-auto-flow: row;
    }

    /* Vertical and horizontal stacking logic */
    :host(.qti-orientation-vertical[class*='qti-choices-stacking-']) [part='slot'] {
      grid-auto-flow: dense column;
      grid-auto-columns: 1fr;
      grid-template-columns: repeat(var(--stacking-count), 1fr);
      grid-template-rows: repeat(calc(var(--item-count) / var(--stacking-count)), 1fr);
    }

    :host(.qti-orientation-horizontal[class*='qti-choices-stacking-']) [part='slot'] {
      grid-auto-flow: row;
      grid-template-columns: repeat(var(--stacking-count), 1fr);
      grid-template-rows: unset;
    }

    /* Ensure even distribution in vertical mode */
    :host(.qti-orientation-vertical) ::slotted(qti-simple-choice:nth-child(even)) {
      grid-row: auto;
    }
  `
];
