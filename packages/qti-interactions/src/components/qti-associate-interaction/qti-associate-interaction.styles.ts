import { css } from 'lit';

export default css`
  :host {
    display: block; /* necessary to calculate scaling position */
  }
  slot[name='qti-simple-associable-choice'] {
    display: flex;
    align-items: flex-start;
    flex: 1;
    border: 2px solid transparent;
    padding: 0.3rem;
    border-radius: 0.3rem;
    gap: 0.5rem;
  }

  slot[name='qti-simple-associable-choice'][hover] {
    border-color: var(--qti-border-active) !important;
    border-style: solid !important;
    background-color: var(--qti-bg-active) !important;
  }

  slot[name='qti-simple-associable-choice'][active] {
    border-color: var(--qti-border-active) !important;
    background-color: var(--qti-bg-active) !important;
  }

  [part='drop-list'] {
    display: flex;
    flex-direction: column;
    border: 2px solid transparent;
    border-radius: 0.25rem;
    min-width: var(--qti-drop-min-width, 6rem);
    min-height: var(--qti-drop-min-height, 2.5rem);
    box-sizing: border-box;
  }

  [part='drop-list'] > qti-simple-associable-choice {
    width: 100%;
    box-sizing: border-box;
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
    border-style: solid !important;
    background-color: var(--qti-bg-active) !important;
  }

  :host::part(associables-container) {
    display: flex;
    padding: 0.5rem;
    min-height: 3rem;
    justify-content: space-between;
    background: linear-gradient(
      180deg,
      rgb(0 0 0 / 0%) calc(50% - 1px),
      var(--qti-border-color-gray) calc(50%),
      rgb(0 0 0 / 0%) calc(50% + 1px)
    );
  }
`;
