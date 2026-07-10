import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    /* A drop target — see qti-gap.styles.ts. The interaction publishes the chip measurements as
     custom properties on its host; the properties themselves live here. */
    :host {
      display: flex;
      user-select: none;
      position: absolute;
      min-height: var(--qti-dropzone-min-height, 0);
      min-width: var(--qti-dropzone-min-width, 0);
    }

    /* The hotspot's own box comes from its authored coords; the drop region simply fills it. */
    [part~='drop'] {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  `
];
