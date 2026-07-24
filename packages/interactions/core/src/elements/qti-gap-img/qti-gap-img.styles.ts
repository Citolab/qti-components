import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    /* Centred, because a gap-img is a picture inside a drop the same size as it. Was in the theme's
       graphic-gap-match rules, on the host from the document. */
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
  `
];
