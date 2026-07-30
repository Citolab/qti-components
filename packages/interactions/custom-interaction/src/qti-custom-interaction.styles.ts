import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    /* The box this element already had. See the note in qti-match-interaction.styles.ts. */
    :host {
      display: block;
    }
  `
];
