import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    /* The containing block of every placed copy. */
    :host {
      display: inline-block;
      position: relative;
    }
    ::slotted(img),
    ::slotted(picture) {
      display: block;
      max-width: 100%;
      height: auto;
      user-select: none;
    }
  `
];
