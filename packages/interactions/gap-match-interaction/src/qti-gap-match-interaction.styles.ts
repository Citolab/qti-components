import { css } from 'lit';

import { boxSizing, validationMessage } from '@qti-components/base';
// import componentStyles from '../../utilities/styles/component.styles';
// :host {
//   display: inline-block;
//   position: relative;
// }
/* ${componentStyles} */
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
    }

    :host(.qti-choices-top) {
      flex-direction: column;
    }
    :host(.qti-choices-bottom) {
      flex-direction: column-reverse;
    }
    :host(.qti-choices-left) {
      flex-direction: row;
    }
    :host(.qti-choices-right) {
      flex-direction: row-reverse;
    }
    /* [part='drops'] , */
    [name='prompt'] {
      width: 100%;
    }
    /* Wraps, for the reason spelled out on associate's identical bank: nowrap does not overflow, it
       shrinks, and a squeezed chip is worse than a second line. */
    [name='drags'] {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      flex: 1;
      border: 2px solid transparent;
      padding: 0.3rem;
      border-radius: 0.3rem;
      gap: 0.5rem;
    }

    /* An answer key shows the answer, not the bank you would have dragged it from. The attribute is
       set on the clone by the correct-response mixin; the theme used to do this with a
       '.full-correct-response' descendant selector, from the document. */
    :host([answer-key]) [part~='drags'] {
      display: none;
    }
  `
];
