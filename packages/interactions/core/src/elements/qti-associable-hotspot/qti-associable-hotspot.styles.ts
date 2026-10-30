import { css } from 'lit';

import { boxSizing, dropRegion } from '@qti-components/base';

export default [
  boxSizing,
  dropRegion,
  css`
    /* A drop target — see qti-gap.styles.ts. The interaction publishes the chip measurements as
     custom properties on its host; the properties themselves live here. */
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      position: absolute;
      min-height: var(--qti-dropzone-min-height, 0);
      min-width: var(--qti-dropzone-min-width, 0);
    }

    /* The hotspot's own box comes from its authored coords; the drop region simply fills it. */
    [part~='drop'] {
      width: 100%;
      height: 100%;
    }

    /* A placed chip keeps the box it had in the bank, even in a hotspot narrower than it (a boxed
       word on a small region): shrinking would wrap or squeeze its text (drag-drop.invariance). */
    [part~='chip'] {
      flex-shrink: 0;
    }
  `
];
