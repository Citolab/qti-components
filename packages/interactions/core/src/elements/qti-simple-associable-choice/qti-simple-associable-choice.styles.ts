import { css } from 'lit';

export default css`
  :host {
    display: flex;
    user-select: none;
  }
  slot {
    width: 100%;
    display: block;
  }
  slot[name='qti-simple-associable-choice'] {
    width: auto;
  }
`;
