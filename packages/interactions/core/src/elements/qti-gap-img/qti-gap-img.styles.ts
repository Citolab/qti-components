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
      /* In graphic-gap-match the picture's authored size is in the graphic's coordinate space, so it
         scales with the graphic and keeps fitting its hotspot. The interaction publishes the factor;
         anywhere else it is unset and the chip keeps its size. */
      zoom: var(--qti-graphic-scale, 1);
    }
  `
];
