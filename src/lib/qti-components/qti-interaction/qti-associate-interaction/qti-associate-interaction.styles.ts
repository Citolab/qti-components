import { css } from 'lit';

export default css`
  :host {
    display: block; /* necessary to calculate scaling position */
  }
  slot[name='qti-simple-associable-choice'] {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  :host::part(associables-container) {
    display: flex;
    justify-content: space-between;
    background: linear-gradient(
      180deg,
      rgb(0 0 0 / 0%) calc(50% - 1px),
      var(--qti-border-color-gray) calc(50%),
      rgb(0 0 0 / 0%) calc(50% + 1px)
    );
  }
`;
