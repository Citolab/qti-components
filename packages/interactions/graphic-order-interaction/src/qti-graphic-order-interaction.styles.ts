import { css } from 'lit';

import { boxSizing, validationMessage } from '@qti-components/base';

export default [
  boxSizing,
  validationMessage,
  css`
    /* The order pins are anchored outside their hotspot's box. */
    :host {
      overflow: visible;
    }

    slot:not([name='prompt']) {
      position: relative; /* qti-hotspot-choice relative to the slot */
      display: block;
      width: fit-content; /* hotspots not stretching further if image is at max size */
    }

    /*
     * The order pin. A light-DOM <span> this interaction appends (see #LOCATOR_CLASS), so it lands
     * in the default slot above and ::slotted() reaches it — its containing block is that slot.
     *
     * Placement only. The pin's face — the teardrop SVG, its fill, the number's colour and size —
     * is paint and stays in the theme, which is also where the --qti-graphic-order-pin-* tokens
     * live. 'position-anchor' is repeated as a declaration because the JS writes the per-hotspot
     * anchor name inline; this is the property's home, the inline style is its value.
     */
    ::slotted(.qti-graphic-order-marker) {
      position: absolute;
      left: anchor(center);
      top: anchor(center);
      transform: translate(-50%, var(--qti-graphic-order-pin-anchor));
      display: flex;
      justify-content: center;
      align-items: flex-start;
      z-index: 3;
    }
    ::slotted(img) {
      /* image not selectable anymore */
      pointer-events: none;
      user-select: none;
    }
  `
];
