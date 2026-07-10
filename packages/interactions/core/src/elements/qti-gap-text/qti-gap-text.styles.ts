import { css } from 'lit';

import { boxSizing, correctionPart } from '@qti-components/base';

export default [
  boxSizing,
  correctionPart,
  css`
    :host {
      display: inline-flex;
      user-select: none;
    }
  `
];
