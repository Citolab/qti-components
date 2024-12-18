import { css } from 'lit';
// import componentStyles from '../../utilities/styles/component.styles';

/* ${componentStyles} */
export default css`
  slot:not([hidden]) {
    /* slot where the */
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start; /* prevents the drag and drop container slots having the same height */
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
`;
