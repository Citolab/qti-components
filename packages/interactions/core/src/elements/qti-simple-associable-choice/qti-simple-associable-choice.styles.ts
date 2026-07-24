import { css } from 'lit';

import { boxSizing, dropRegion } from '@qti-components/base';

export default [
  boxSizing,
  dropRegion,
  css`
    /*
     * 'align-items' / 'justify-content' are variables because one caller cannot be reached any other
     * way. In tabular match this element is a light-DOM *grandchild* of the slotted
     * <qti-simple-match-set>, so no selector in the interaction's shadow root reaches it —
     * '::slotted()' takes no descendants — and the element itself cannot tell it is in a tabular
     * match. The theme sets the two properties on the match-set and they inherit down; the box model
     * stays here. Defaults are the flex initial values, so every other caller is unaffected.
     */
    :host {
      display: flex;
      align-items: var(--qti-choice-align-items, normal);
      justify-content: var(--qti-choice-justify-content, normal);
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
      /*
       * A target is a card: label pinned to the top, drop region filling the rest. Was
       * 'display: flex; flex-direction: column; justify-content: space-between' in the theme's
       * match-interaction rules, on a light-DOM grandchild it reached by descendant selector.
       * A 'grid-row: unset' went with it — the initial value, on an element whose grid placement
       * nothing sets.
       */
      flex-direction: column;
      justify-content: space-between;
    }

    :host([qti-droppable]) [part~='drop'] {
      /*
       * Match's dropzones are NOT auto-sized from the chips: a match target is a category, and
       * should look able to hold several answers rather than hugging the widest one. The floor is a
       * vendor token, so a theme decides how generous.
       */
      min-height: var(--qti-drop-min-height, 4rem);
      /*
       * The one place a drop centres its chips rather than packing them to the start, overriding
       * dropRegion. A match target is a category card with room to spare, so chips sitting in the
       * middle of it reads as deliberate where a lone chip pinned to the top-left reads as broken.
       * Centring positions without resizing — 'align-items: center' suppresses the stretch just as
       * 'flex-start' does — so the chip-is-the-same-chip invariant holds either way.
       */
      justify-content: center;
      align-items: center;
      flex-grow: 1;
    }

    /* The label sits against the drop region below it. */
    :host([qti-droppable]) [part~='label'] {
      align-content: flex-end;
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

    /*
     * The label's box type is a variable for the same reason as the two above: only the interaction
     * knows which arrangement it is running. Non-tabular match wants an inline label so a chip hugs
     * its text; everywhere else the label is a block that fills the choice. The theme spent an
     * 'display: inline !important' on ::part(label) to say so, from the document.
     */
    slot {
      width: 100%;
      display: var(--qti-choice-label-display, block);
    }

    slot[name='qti-simple-associable-choice'] {
      width: auto;
    }

    /* Author markup inside a chip runs inline — a <p> would otherwise break the chip onto its own
       line. The theme keeps the matching 'margin: 0', which is spacing. */
    ::slotted(p) {
      display: inline;
    }
  `
];
