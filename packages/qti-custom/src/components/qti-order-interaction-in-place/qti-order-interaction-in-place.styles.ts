import { css } from 'lit';

export default css`
  [part='drags'] {
    display: flex;
    align-items: flex-start;
    flex: 1;
    flex-wrap: wrap;
  }

  ::slotted(qti-simple-choice) {
    width: var(--choice-width);
    box-sizing: border-box;
  }

  ::slotted(qti-simple-choice:focus) {
    outline: none;
    box-shadow: none !important;
  }

  /* Keyboard dragging state */
  ::slotted(qti-simple-choice[data-keyboard-dragging]) {
    outline: 2px solid var(--qti-border-active) !important;
    outline-offset: 2px !important;
    opacity: 0.7 !important;
  }

  :host([orientation='horizontal']) [part='drags'] {
    flex-direction: row;
  }
  :host([orientation='vertical']) [part='drags'] {
    flex-direction: column;
  }

  :host {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  :host(.qti-choices-top) [part='container'] {
    flex-direction: column;
  }
  :host(.qti-choices-bottom) [part='container'] {
    flex-direction: column-reverse;
  }
  :host(.qti-choices-left) [part='container'] {
    flex-direction: row;
  }
  :host(.qti-choices-right) [part='container'] {
    flex-direction: row-reverse;
  }
`;
