import { css } from 'lit';

export default css`
  :host {
    display: block;
    width: 100%;
  }

  [part='container'] {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  [part='items-container'] {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start; /* Allow items to size themselves */
  }

  ::slotted(qti-simple-choice) {
    display: flex;
    align-items: center;
    padding: var(--qti-padding-vertical) var(--qti-padding-horizontal);
    background: var(--qti-choice-background, white);
    border: 1px solid var(--qti-border-color, #ddd);
    border-radius: 6px;
    cursor: grab;
    user-select: none;
    position: relative;
    width: auto;
    flex-shrink: 0;
  }

  ::slotted(qti-simple-choice:hover) {
    background: var(--qti-choice-hover-background, #f5f5f5);
    border-color: var(--qti-primary-color, #007acc);
  }

  ::slotted(qti-simple-choice.dragging) {
    cursor: grabbing !important;
    border: 2px solid var(--qti-primary-color, #007acc) !important;
    background-color: var(--qti-choice-hover-background, #f0f8ff) !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
    z-index: 1000 !important;
    opacity: 0.9 !important;

    /* Override global .dragging styles that cause rotation */
    rotate: none !important;
    transform: none !important;
    transition: none !important;
  }

  /* Candidate correction states */
  ::slotted(qti-simple-choice:state(candidate-correct)),
  ::slotted(qti-simple-choice[candidate-correct]) {
    background-color: var(--qti-correct, #66bb6a) !important;
    border-color: var(--qti-correct-border, var(--qti-correct, #66bb6a)) !important;
    color: white !important;
  }

  ::slotted(qti-simple-choice:state(candidate-incorrect)),
  ::slotted(qti-simple-choice[candidate-incorrect]) {
    background-color: var(--qti-incorrect, #f44336) !important;
    border-color: var(--qti-incorrect-border, var(--qti-incorrect, #f44336)) !important;
    color: white !important;
  }

  ::slotted(qti-simple-choice[data-dnd-dragging]) {
    cursor: grabbing;
    border-color: var(--qti-border-active) !important;
    background-color: var(--qti-bg-active) !important;
    padding: var(--qti-padding-vertical) var(--qti-padding-horizontal) !important;
  }

  /* Vertical orientation */
  :host([orientation='vertical']) [part='items-container'] {
    flex-direction: column;
  }

  :host([orientation='vertical']) ::slotted(qti-simple-choice) {
    min-width: 8rem; /* Minimum width for readability and consistent sizing */
  }

  /* Horizontal orientation */
  :host([orientation='horizontal']) [part='items-container'] {
    flex-direction: row;
    flex-wrap: wrap;
  }

  :host([orientation='horizontal']) ::slotted(qti-simple-choice) {
    min-width: 150px;
  }

  ::slotted(qti-simple-choice.correct-option) {
    border: 2px solid var(--qti-correct, #28a745) !important;
    background: var(--qti-correct-background, #d4edda) !important;
  }

  ::slotted(qti-simple-choice.incorrect-option) {
    border: 2px solid var(--qti-incorrect, #dc3545) !important;
    background: var(--qti-incorrect-background, #f8d7da) !important;
  }

  /* Accessibility */
  ::slotted(qti-simple-choice:focus) {
    outline: 2px solid var(--qti-focus-color, #007acc);
    outline-offset: 2px;
  }
`;
