import { css } from 'lit';

import { boxSizing, validationMessage } from '@qti-components/base';

export default [
  boxSizing,
  validationMessage,
  css`
    /* Not positioned on purpose: the placed copies are absolutely positioned against the stage
       (qti-position-object-stage), so they land on its image wherever this tray sits. */
    :host {
      display: inline-block;
      vertical-align: top;
      margin-block-start: var(--qti-gap, 0.5rem);
      margin-inline-end: var(--qti-gap, 0.5rem);
    }

    [part~='object'] {
      display: inline-flex;
      padding: var(--qti-size-field, 0.125rem);
      cursor: grab;
      touch-action: none;
      user-select: none;
    }
    [part~='object'][aria-disabled='true'] {
      cursor: default;
    }
    ::slotted(img) {
      display: block;
      pointer-events: none;
    }

    [part~='point'] {
      position: absolute;
      cursor: grab;
      touch-action: none;
      user-select: none;
      z-index: 1;
    }
    [part~='point'][data-ghost] {
      pointer-events: none;
    }
  `
];
