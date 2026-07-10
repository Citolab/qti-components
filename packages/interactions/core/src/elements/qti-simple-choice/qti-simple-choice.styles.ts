import { css } from 'lit';

import { boxSizing, correctionPart } from '@qti-components/base';

export default [
  boxSizing,
  correctionPart,
  css`
    :host {
      display: flex;
      align-items: center;
      user-select: none;
    }
    slot {
      width: 100%;
      display: flex;
      align-items: center;
    }
    [part='control'] {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
    }
  `
];
