import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    /*
     * A chip's own box. Both drag-drop interactions that use this element laid it out from the
     * theme — gap-match with 'display: flex !important; align-items: center !important',
     * graphic-gap-match with the same plus centred justification — and both were overriding the
     * 'inline-flex' this file used to declare. Flex is what actually rendered, so flex is what it
     * says now.
     *
     * Justification is a variable because only graphic-gap-match centres, where a chip is a tile
     * filling its hotspot. A gap-match chip hugs its text, and centring moved that text.
     */
    /*
     * Centred wherever it lives — this is the one-line follow-up the note here used to promise.
     *
     * It read :host(:not([part~='drag'])), which reproduced an older accident: the centring rule
     * used to be a document selector ('qti-gap-match-interaction qti-gap-text'), and a placed chip
     * lives inside qti-gap's shadow root where no document selector reaches. So a chip in the bank was
     * centred and the same chip in a gap was not, and the stylesheet gave no hint why.
     *
     * That contradicts the layout-invariance contract — a chip is the same chip wherever it stands —
     * and it showed: the correction badge centred in the bank and rode to the top once placed. The
     * badge now sets align-self and no longer depends on this, but the label and the drag grip
     * still did. Making it unconditional costs a one-pixel text shift on placed chips, which is the
     * rendering change the old note was deferring, and a VRT re-baseline.
     */
    :host {
      display: flex;
      align-items: center;
      justify-content: var(--qti-drag-justify-content, normal);
      user-select: none;
    }
  `
];
