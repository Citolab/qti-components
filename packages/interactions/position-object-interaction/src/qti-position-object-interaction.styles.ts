import { css } from 'lit';

export default css`
  :host {
    display: block;
  }
  ::slotted(img) {
    position: absolute;
    cursor: move;
    user-select: none;
    left: 50%;
    transform: translateX(-50%);
  }
`;
