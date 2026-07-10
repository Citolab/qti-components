import { css } from 'lit';

import { boxSizing, correctionPart, dropRegion } from '@qti-components/base';

export default [
  boxSizing,
  correctionPart,
  dropRegion,
  css`
    :host {
      display: flex;
      user-select: none;
    }

    /*
     * This element plays two parts. In associate-interaction and in match's first match-set it is a
     * draggable chip; in match's last match-set it is a drop target. In tabular match it is neither —
     * drag-drop is off and it is a row or column header in a grid.
     *
     * So the drop-target rules key on [qti-droppable], the attribute the interaction stamps on the
     * elements it actually tracks as droppables. Keying on the *absence* of a chip marker instead
     * (:not(:state(drag))) swept up every tabular header cell and gave each one a 4rem minimum.
     */
    :host([qti-droppable]) {
      min-height: var(--qti-drop-min-height, 4rem);
      min-width: var(--qti-drop-min-width, 0);
    }

    :host([qti-droppable]) [part~='drop'] {
      /*
       * Match's dropzones are NOT auto-sized from the chips: a match target is a category, and
       * should look able to hold several answers rather than hugging the widest one. The floor is a
       * vendor token, so a theme decides how generous.
       */
      min-height: var(--qti-drop-min-height, 4rem);
    }

    /*
     * A chip has no drop region. It renders one anyway — same element, both parts — and an empty
     * region with a minimum height made every placed chip 20px taller than the same chip in the
     * bank. The <slot> this replaced collapsed to nothing by accident; a div has to be told.
     *
     * Two conditions, because a chip identifies itself two ways:
     *   :state(drag)    a chip in the light-DOM bank, from the interaction's draggablesSelector
     *   [part~='drag']  a chip a drop target renders, where that selector cannot reach it — match's
     *                   selector names a light-DOM ancestry the placed clone no longer has
     */
    :host(:state(drag)) [part~='drop'],
    :host([part~='drag']) [part~='drop'] {
      display: none;
    }

    slot {
      width: 100%;
      display: block;
    }

    slot[name='qti-simple-associable-choice'] {
      width: auto;
    }
  `
];
