import { css } from 'lit';

export default css`
  /* A drop target — see qti-gap.styles.ts. The interaction publishes the chip measurements as
     custom properties on its host; the properties themselves live here. */
  :host {
    display: flex;
    user-select: none;
    position: absolute;
    min-height: var(--qti-dropzone-min-height, 0);
    min-width: var(--qti-dropzone-min-width, 0);
  }
`;
