import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    /* PK: display host as block, else design will be collapsed */
    /* 'position: relative' anchors the correction glyph the theme draws over the textarea. */
    :host {
      display: block;
      position: relative;
    }
    textarea {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      border: 0;
    }
  `
];
