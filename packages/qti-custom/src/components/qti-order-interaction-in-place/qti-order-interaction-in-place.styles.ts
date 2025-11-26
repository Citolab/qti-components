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

  /* Disabled state */
  :host([disabled]) {
    opacity: 0.6;
    pointer-events: none;
  }

  :host([disabled]) ::slotted(qti-simple-choice) {
    cursor: not-allowed !important;
    opacity: 0.7;
  }

  /* Readonly state */
  :host([readonly]) ::slotted(qti-simple-choice) {
    cursor: default !important;
  }
`;
