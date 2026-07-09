import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
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
  `
];
