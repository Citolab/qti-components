import { css } from 'lit';
// import componentStyles from '../../utilities/styles/component.styles';
// :host {
//   display: inline-block;
//   position: relative;
// }
/* ${componentStyles} */
export default css`
  [part='drags'] {
    display: flex;
    align-items: flex-start;
    flex: 1;
    flex-wrap: wrap;
  }

  [part='drops'] {
    flex: 1;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
  }

  :host([orientation='horizontal']) [part='drags'] {
    flex-direction: row;
  }
  :host([orientation='horizontal']) [part='drops'] {
    grid-auto-flow: column;
  }
  :host([orientation='vertical']) [part='drags'] {
    flex-direction: column;
  }
  :host([orientation='vertical']) [part='drops'] {
    grid-auto-flow: row;
  }

  [part='drop-list'] {
    display: block;
    flex: 1;
    border: 2px solid transparent;
    border-radius: 0.25rem;
    min-height: 3rem;
  }

  [part='drop-list'][active] {
    border-color: var(--qti-border-active) !important;
    background-color: var(--qti-bg-active) !important;
  }

  [part='drop-list'][enabled] {
    background-color: var(--qti-bg-active) !important;
  }

  [part='drop-list'][hover] {
    border-color: var(--qti-border-active) !important;
    background-color: var(--qti-bg-active) !important;
    outline: 3px solid var(--qti-border-active) !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
  }

  [part='container'] {
    display: flex;
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

  /* Clones placed in droplists - minimal styling to avoid drag issues */
  .qti-droplist-clone {
    display: block !important;
    margin: 0 !important;
    position: static !important;
    transform: none !important;
    z-index: auto !important;
  }

  /* Hide the source element during drag to let dnd-kit handle the drag preview */
  :host ::slotted(.dragging),
  .dragging {
    opacity: 0.5 !important;
  }

  /* Hidden original elements */
  :host .qti-original-hidden,
  ::slotted(.qti-original-hidden) {
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
  }

  /* Visible original elements */
  :host .qti-original-visible,
  ::slotted(.qti-original-visible) {
    opacity: 1 !important;
    pointer-events: auto !important;
    visibility: visible !important;
  }

  /* Keyboard dragging visual feedback */
  ::slotted([data-keyboard-dragging]),
  [data-keyboard-dragging] {
    outline: 2px solid var(--qti-border-active) !important;
    outline-offset: 2px !important;
    opacity: 0.7 !important;
  }

  /* Inventory/drag container hover state during keyboard navigation */
  [part='drags'][hover] {
    background-color: var(--qti-bg-active) !important;
  }
`;
