import { css } from 'lit';

import { boxSizing, validationMessage } from '@qti-components/base';
// import componentStyles from '../../utilities/styles/component.styles';

/* ${componentStyles} */
export default [
  boxSizing,
  validationMessage,
  css`
    slot:not([hidden]) {
      /* slot where the */
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    :host(.qti-choices-top) slot {
      flex-direction: column;
    }
    :host(.qti-choices-bottom) slot {
      flex-direction: column-reverse;
    }
    :host(.qti-choices-left) slot {
      flex-direction: row;
    }
    :host(.qti-choices-right) slot {
      flex-direction: row-reverse;
    }
    slot[name='prompt'] {
      display: block;
    }
    ::slotted(qti-simple-match-set) {
      /* Make sure the drag and drop container slots have the same width */
      flex: 1;
    }

    /*
     * The two match sets, in drag-drop mode. Both are slotted, so ::slotted() reaches them; the
     * theme used to lay them out by descendant selector from the document.
     *
     * First set is the chip bank — a wrapping row. Last set is the target grid, whose track floor is
     * a token so a theme can decide how wide a category card gets. That floor used to be a bare
     * '150px' in the theme, the one responsive breakpoint hiding in a stylesheet that is meant to
     * hold none.
     *
     * The gaps stay in the theme: gap is spacing.
     */
    :host(:not(.qti-match-tabular)) ::slotted(qti-simple-match-set:first-of-type) {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    :host(:not(.qti-match-tabular)) ::slotted(qti-simple-match-set:last-of-type) {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--qti-match-target-min-width, 150px), 1fr));
    }

    /* An answer key shows the answer, not the bank you would have dragged it from. The attribute is
       set on the clone by the correct-response mixin; the theme used to do this with a
       '.full-correct-response' descendant selector, from the document. */
    :host([answer-key]:not(.qti-match-tabular)) ::slotted(qti-simple-match-set:first-of-type) {
      display: none;
    }

    /* Same for a disabled interaction: nothing left to drag, so no bank. */
    :host(:disabled:not(.qti-match-tabular)) ::slotted(qti-simple-match-set:first-of-type) {
      display: none;
    }
  `
];
