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

  :host::part(associables-container) {
    display: flex;
    padding: 0.5rem;
    justify-content: space-between;
    background: linear-gradient(
      180deg,
      rgb(0 0 0 / 0%) calc(50% - 1px),
      var(--qti-border-color-gray) calc(50%),
      rgb(0 0 0 / 0%) calc(50% + 1px)
    );
  }
`;
