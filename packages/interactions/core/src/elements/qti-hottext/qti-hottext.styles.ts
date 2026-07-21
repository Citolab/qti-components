import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    :host {
      display: inline-flex;
      align-items: center;
      margin: var(--qti-inline-margin, 0);
      padding: var(--qti-inline-padding, 1px 4px);
    }
  `
];
