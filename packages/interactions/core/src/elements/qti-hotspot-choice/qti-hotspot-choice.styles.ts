import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    :host {
      display: flex;
      user-select: none;
      position: absolute;
    }

    /*
     * Graphic-order paints an order pin anchored to this hotspot, and the pin sits outside the
     * hotspot's own box. Both of these were in the theme, keyed on the same ARIA attributes the
     * interaction already writes to the host.
     */
    :host([aria-ordervalue]) {
      overflow: visible;
    }

    :host([aria-ordercorrectvalue]) {
      display: grid;
      place-content: center;
    }
  `
];
