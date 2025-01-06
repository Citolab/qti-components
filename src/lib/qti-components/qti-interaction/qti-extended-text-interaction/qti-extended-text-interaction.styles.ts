import { css } from 'lit';

export default css`
  /* PK: display host as block, else design will be collapsed */
  :host {
    display: block;
  }
  textarea {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;
