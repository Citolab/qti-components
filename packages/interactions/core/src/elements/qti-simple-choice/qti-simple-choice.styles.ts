import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    /*
     * 'position: relative' unconditionally, because this element can carry a correction badge and a
     * badge needs a containing block. The theme draws the badge as an absolutely positioned ::after
     * and used to declare the containing block too — from the document, and only for the
     * .qti-input-control-hidden variant, so the anchor and the thing anchored to it were set in two
     * different stylesheets. See CONTRACT.md §7.
     */
    :host {
      display: flex;
      align-items: center;
      position: relative;
      user-select: none;
    }
    /*
     * The label's box type is a variable because only the interaction knows the arrangement.
     * choice-interaction wants an inline label so a choice hugs its text; order-interaction uses
     * this same element as a chip and wants the flex default. The theme said so with an
     * '::part(label) { display: inline !important }'.
     */
    slot {
      width: 100%;
      display: var(--qti-choice-label-display, flex);
      align-items: center;
    }
    /*
     * The variant that hides the native control ('.qti-input-control-hidden') is a presentation
     * class only the interaction sees, on a box only this file can lay out. The theme sets the
     * variable; the property stays here.
     */
    [part='control'] {
      display: var(--qti-control-display, flex);
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
    }
  `
];
