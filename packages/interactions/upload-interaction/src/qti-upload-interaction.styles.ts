import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    :host {
      display: block;
      margin: 1em 0;
    }
    input[type='file'] {
      display: block;
      margin-top: 0.5em;
    }
  `
];
