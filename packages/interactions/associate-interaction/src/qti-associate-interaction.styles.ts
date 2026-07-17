import { css } from 'lit';

import { boxSizing, dropRegion } from '@qti-components/base';

/**
 * Layout and sizing only. Paint and state live in the theme.
 *
 * `[part~='drop'][active]` and `[part~='drop'][enabled]` moved to
 * `styles/qti-theme/interactions/qti-associate-interaction.css` as `::part(active)` /
 * `::part(enabled)`, since an attribute selector cannot follow `::part()` and a <div> cannot carry
 * a custom state. Both carried `!important`, which only existed to beat the shadow's own rules from
 * the shadow. Neither needs it from the theme.
 */

export default [
  boxSizing,
  dropRegion,
  css`
    :host {
      display: block; /* necessary to calculate scaling position */
    }
    slot[part~='drags'] {
      display: flex;
      align-items: flex-start;
      flex: 1;
      border: 2px solid transparent;
      margin: 1rem 0;
      border-radius: 0.3rem;
      gap: 0.5rem;
    }

    /* Drop target. --qti-dropzone-min-height is published by the interaction from the measured
     chip height; 3rem is the fallback when there is nothing to measure. Was an inline style. */
    [part~='drop'] {
      display: grid;
      min-height: var(--qti-dropzone-min-height, 3rem);
      min-width: var(--qti-dropzone-min-width, 3rem);
      border: 1px solid var(--qti-border-color, #d1d5db);
      border-radius: 0.25rem;
      overflow: hidden;
    }

    [part='drops'] {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    :host::part(drop-row) {
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
