import { css } from 'lit';

import { boxSizing, validationMessage } from '@qti-components/base';

export default [
  boxSizing,
  validationMessage,
  css`
    /* Containing block for the absolutely positioned hotspots over the image. Was on this host in
       the theme, together with a 'display: block' this component now owns. */
    :host {
      display: block;
      position: relative;
    }

    slot:not([name='prompt']) {
      display: block;
      width: fit-content; /* hotspots not stretching further if image is at max size */
    }
    ::slotted(img) {
      /* image not selectable anymore */
      pointer-events: none;
      user-select: none;
    }
    ::slotted(qti-associable-hotspot) {
      transform: translate(-50%, -50%);
    }
    line-container {
      display: block;
      position: relative;
      width: fit-content;
    }
    svg {
      position: absolute;
      top: 0px;
      left: 0px;
    }
  `
];
