import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
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
  `
];
