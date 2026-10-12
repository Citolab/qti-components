import { css } from 'lit';

import { boxSizing, validationMessage } from '@qti-components/base';

export default [
  boxSizing,
  validationMessage,
  css`
    :host {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
      flex-wrap: wrap;
      gap: 0.5rem;
      /* Containing block for the absolutely positioned hotspots over the image. Was set on this
         host from the theme. */
      position: relative;
    }

    :host(.qti-choices-top) {
      flex-direction: column-reverse;
    }
    :host(.qti-choices-bottom) {
      flex-direction: column;
    }
    :host(.qti-choices-left) {
      flex-direction: row-reverse;
      & [name='drags'] {
        width: 25%;
      }
      & [part='image'] {
        /* A cap, not a width: the slot must stay exactly the graphic's box (see below). */
        max-width: 75%;
      }
    }
    :host(.qti-choices-right) {
      flex-direction: row;
      & [name='drags'] {
        width: 25%;
      }
      & [part='image'] {
        /* A cap, not a width: the slot must stay exactly the graphic's box (see below). */
        max-width: 75%;
      }
    }
    /*
     * The coordinate space the drop areas sit on. Every qti-associable-hotspot is position:absolute
     * and placed with left/top percentages of the graphic (positionShapes), so this slot must be
     * (a) a positioning context and (b) exactly the box of the graphic — the same contract as the
     * hotspot interaction's slot.
     *
     *   width: fit-content   shrink-wraps the slot to the graphic instead of the full row, so a
     *                        percentage of the slot is a percentage of the picture.
     *   max-width: 100%      lets the slot, and with it the graphic, narrow to the container.
     */
    [part='image'] {
      display: block;
      position: relative;
      width: fit-content;
      max-width: 100%;
    }
    /* [part='drops'] , */

    [name='drags'] {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      flex: 1;
      border: 2px solid transparent;
      padding: 0.3rem;
      border-radius: 0.3rem;
      gap: 0.5rem;
    }
    /*
     * Fluid, like the hotspot interaction's graphic: an item declares the graphic at the size its
     * coords were authored in (often a full-resolution picture, 1600px wide), and it must still fit a
     * column or a phone. The drop areas are percentages of it, so they scale along.
     *
     *   max-width: 100%   shrinks a graphic wider than its container, never upscales a small one.
     *   height: auto      keeps the aspect ratio the width/height attributes declare; without it the
     *                     height attribute pins the height while the width shrinks.
     *   display: block    no inline descender gap under the picture, which would make the slot
     *                     taller than the graphic and skew every vertical percentage.
     */
    ::slotted(img),
    ::slotted(object) {
      display: block;
      max-width: 100%;
      height: auto;
      user-select: none;
      pointer-events: none;
    }
  `
];
