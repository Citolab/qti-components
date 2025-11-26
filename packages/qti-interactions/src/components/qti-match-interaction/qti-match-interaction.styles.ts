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
  }

  ::slotted(qti-simple-associable-choice[enabled]) {
    background-color: var(--qti-bg-active) !important;
  }

  ::slotted(qti-simple-associable-choice[active]) {
    border-color: var(--qti-border-active) !important;
    background-color: var(--qti-bg-active) !important;
  }

  ::slotted(qti-simple-associable-choice[hover]) {
    border-color: var(--qti-border-active) !important;
    border-style: solid !important;
    background-color: var(--qti-bg-active) !important;
  }

  /* Drag clone styles */
  .qti-droplist-clone {
    display: block !important;
    margin: 0 !important;
    position: static !important;
    transform: none !important;
    z-index: auto !important;
  }

  /* Dragging state */
  ::slotted(.dragging),
  .dragging {
    opacity: 0.5 !important;
  }

  /* Original element visibility utilities */
  :host .qti-original-hidden,
  ::slotted(.qti-original-hidden) {
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
  }

  :host .qti-original-visible,
  ::slotted(.qti-original-visible) {
    opacity: 1 !important;
    pointer-events: auto !important;
    visibility: visible !important;
  }

  /* Keyboard dragging state */
  ::slotted([data-keyboard-dragging]),
  [data-keyboard-dragging] {
    outline: 2px solid var(--qti-border-active) !important;
    outline-offset: 2px !important;
    opacity: 0.7 !important;
  }
`;
