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
    :host {
      display: flex;
      justify-content: var(--qti-drag-justify-content, normal);
      user-select: none;
    }

    /*
     * KNOWN INCONSISTENCY, preserved deliberately.
     *
     * A bank chip is vertically centred; a chip already dropped into a gap is not. That is not a
     * design decision — it is what the theme happened to produce. Its rule was
     * 'qti-gap-match-interaction qti-gap-text', a document selector, and a placed chip lives inside
     * qti-gap's shadow root where no document selector reaches. So the bank got centring and the
     * gap did not, and nobody could see the difference in the stylesheet that caused it.
     *
     * Moving the rule here made it uniform, which is what the layout-invariance contract asks for —
     * a chip is the same chip wherever it lives — and shifted every placed chip's text by a pixel.
     * That is a rendering change, not a relocation, so it is not made here. The condition below
     * reproduces the old split exactly: [part~='drag'] marks the copy a drop target renders.
     *
     * Unifying this is a one-line follow-up plus a VRT baseline.
     */
    :host(:not([part~='drag'])) {
      align-items: center;
    }
  `
];
