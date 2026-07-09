import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    :host {
      display: block; /* necessary to calculate scaling position */
    }
    slot[part='associable-choices'] {
      display: flex;
      align-items: flex-start;
      flex: 1;
      border: 2px solid transparent;
      margin: 1rem 0;
      border-radius: 0.3rem;
      gap: 0.5rem;
    }

    [part='drop-list'][active] {
      border-color: var(--qti-border-active) !important;
      background-color: var(--qti-bg-active) !important;
    }

    /* Drop target. --qti-dropzone-min-height is published by the interaction from the measured
     chip height; 3rem is the fallback when there is nothing to measure. Was an inline style. */
    [part='drop-list'] {
      display: grid;
      min-height: var(--qti-dropzone-min-height, 3rem);
      min-width: 10rem;
      border: 1px solid var(--qti-border-color, #d1d5db);
      border-radius: 0.25rem;
      box-sizing: border-box;
    }

    [part='drop-container'] {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    [part='drop-list'][enabled] {
      background-color: var(--qti-bg-active) !important;
    }

    :host::part(associables-container) {
      display: flex;
      justify-content: space-between;
      background: linear-gradient(
        180deg,
        rgb(0 0 0 / 0%) calc(50% - 1px),
        var(--qti-border-color) calc(50%),
        rgb(0 0 0 / 0%) calc(50% + 1px)
      );
    }
  `
];
