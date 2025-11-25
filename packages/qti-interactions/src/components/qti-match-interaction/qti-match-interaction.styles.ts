import { css } from 'lit';
// import componentStyles from '../../utilities/styles/component.styles';

/* ${componentStyles} */
export default css`
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

  /* Drop zone styles for drag and drop */
  ::slotted(qti-simple-associable-choice[enabled]),
  ::slotted(qti-simple-associable-choice[active]),
  ::slotted(qti-simple-associable-choice[hover]) {
    min-height: 3rem;
    padding: 0.5rem;
    border: 2px solid transparent;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
  }

  ::slotted(qti-simple-associable-choice[enabled]) {
    background-color: var(--qti-bg-active, rgba(0, 123, 255, 0.05));
    border-color: var(--qti-border-color-gray, #dee2e6);
  }

  ::slotted(qti-simple-associable-choice[active]) {
    background-color: var(--qti-bg-active, rgba(0, 123, 255, 0.1));
    border-color: var(--qti-border-active, #007bff);
  }

  ::slotted(qti-simple-associable-choice[hover]) {
    background-color: var(--qti-bg-active, rgba(0, 123, 255, 0.15));
    border-color: var(--qti-border-active, #007bff);
    border-style: solid;
  }
`;
