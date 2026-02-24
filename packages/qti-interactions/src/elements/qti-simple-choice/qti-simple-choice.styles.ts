import { css } from 'lit';

export default css`
  :host {
    display: flex;
    align-items: center;
    user-select: none;
  }
  slot {
    width: 100%;
    display: flex;
    align-items: center;
  }
  [part='ch'] {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }
`;
