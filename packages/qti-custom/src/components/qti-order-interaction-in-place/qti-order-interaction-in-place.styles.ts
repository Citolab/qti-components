import { css } from 'lit';

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
  }

  [part='drop-list'][active] {
    border-color: var(--qti-border-active) !important;
    background-color: var(--qti-bg-active) !important;
  }

  [part='drop-list'][enabled] {
    background-color: var(--qti-bg-active) !important;
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
`;
