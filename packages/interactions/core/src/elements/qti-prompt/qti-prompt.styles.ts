import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    :host {
      display: block;
      margin: var(--qti-gap) 0;
      width: 100%;
    }
  `
];
