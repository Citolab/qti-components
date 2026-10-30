import { css } from 'lit';

import { boxSizing, dropRegion, validationMessage } from '@qti-components/base';

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
  validationMessage,
  dropRegion,
  css`
    :host {
      display: block; /* necessary to calculate scaling position */
    }
    /* The bank WRAPS. Without flex-wrap the row is nowrap, and a flex item's default flex-shrink: 1
       then compresses the chips instead of moving them down: a bank of six squeezed the last chip
       until only its grip was left, at no width the author could see coming. A chip is a fixed
       thing, so the only place the overflow can go is the next line. */
    [part~='bank'] {
      /* The bank, the same in every drag-drop interaction: flush with the container (no padding, no
         margin, no edge of its own), chips a --qti-gap apart. Its lit and ringed looks while a chip is
         in flight are the theme's ('::part(bank drag-active)', '::part(bank drag-over)'). */
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      flex: 1;
      gap: var(--qti-gap, 0.5rem);
      padding: 0;
      margin: 0;
      border: 0;
      border-radius: var(--qti-radius-box, 0.2rem);
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

    :host::part(row) {
      display: flex;
      justify-content: space-between;
      background: linear-gradient(
        180deg,
        rgb(0 0 0 / 0%) calc(50% - 1px),
        var(--qti-border-color) calc(50%),
        rgb(0 0 0 / 0%) calc(50% + 1px)
      );
    }

    /* An answer key shows the answer, not the bank you would have dragged it from. The attribute is
       set on the clone by the correct-response mixin; the theme used to do this with a
       '.full-correct-response' descendant selector, from the document. */
    :host([answer-key]) ::slotted(qti-simple-associable-choice) {
      display: none;
    }
  `
];
