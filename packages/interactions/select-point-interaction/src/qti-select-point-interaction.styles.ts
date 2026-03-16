import { css } from 'lit';

export default css`
  :host {
    display: block;
  }
  point-container {
    display: block;
    position: relative;
    width: fit-content;
  }

  ::slotted(img) {
    max-width: 100%;
    height: auto;
    display: block;
  }
`;
