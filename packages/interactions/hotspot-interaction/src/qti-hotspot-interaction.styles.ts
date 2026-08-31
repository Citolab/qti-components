import { css } from 'lit';

import { boxSizing, validationMessage } from '@qti-components/base';

export default [
  boxSizing,
  validationMessage,
  css`
    :host {
      display: block;
    }
    /*
     * This slot is the coordinate space the hotspots sit on. Every qti-hotspot-choice is
     * position:absolute and placed with left/top percentages (positionShapes, hotspot.ts), so the
     * slot must be both (a) a positioning context and (b) exactly the box of the image — or those
     * percentages resolve against the wrong rectangle and every hotspot is offset from the picture.
     *
     *   position: relative     the containing block the percent offsets resolve against. Without it
     *                          they would position against the nearest positioned ancestor.
     *   display: inline-block   shrink-wraps the slot to its content instead of a full-width block,
     *   width: fit-content      and caps that at the width of the image, so the slot never extends
     *                          past the picture and drags a 100%-wide hotspot out with it.
     *
     * A line-height:0 used to sit here to kill the inline descender gap under an image. The image is
     * display:block below, which has no such gap, so it was redundant and is gone.
     */
    slot:not([name='prompt']) {
      position: relative;
      display: inline-block;
      width: fit-content;
    }
    ::slotted(img) {
      display: block; /* out of the inline flow; also why the slot needs no line-height reset */
      pointer-events: none; /* image not selectable; clicks belong to the hotspots over it */
      user-select: none;
      /*
       * Fluid, and unconditionally, unlike the global reset rule img:not([width]) that leaves an
       * authored-size image fixed. A hotspot image is the coordinate space its hotspots sit on (they
       * are percentages of this box), so it MUST fit the viewport: a fixed-width image on a narrow
       * screen would overflow and carry its hotspots off the visible area.
       *
       *   max-width: 100%   caps the image at the container. NOT width:100%, which would force the
       *                     image to fill and upscale a small picture past its natural size into
       *                     blur; max-width shrinks on narrow and never upscales. (With the
       *                     fit-content slot above the two render the same today, but max-width says
       *                     the actual intent.)
       *   height: auto      lets the height follow the aspect ratio the width and height attributes
       *                     declare. Without it a height attribute pins the height while the width
       *                     shrinks, and the image squashes horizontally into an ellipse.
       *
       * The hotspots are percentages of this image, so they scale with it and stay registered; the
       * poly ring masks stretch with their element and keep a uniform stroke.
       */
      max-width: 100%;
      height: auto;
    }
  `
];
