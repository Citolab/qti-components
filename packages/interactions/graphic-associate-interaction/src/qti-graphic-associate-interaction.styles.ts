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
      /* Lines take clicks; the empty canvas lets them through to the points underneath. */
      pointer-events: none;
    }
    /* A wide invisible stroke over each line, so removing one does not take a 3px aim. */
    line[data-hit] {
      stroke: transparent;
      stroke-width: 16px;
      stroke-linecap: round;
      pointer-events: stroke;
      cursor: pointer;
      outline: none;
    }
    /* A line under the pointer or keyboard focus shows that it can be removed. */
    line[data-hit]:hover,
    line[data-hit]:focus-visible {
      stroke: color-mix(in srgb, currentColor 18%, transparent);
    }
    ::slotted(qti-associable-hotspot) {
      cursor: pointer;
    }
  `
];
