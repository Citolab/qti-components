import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    /* 'position: relative' is the containing block for the answer-key tick the theme draws as an
       absolutely positioned ::before. See CONTRACT.md §7. */
    :host {
      display: inline-flex;
      align-items: center;
      position: relative;
      padding: var(--qti-inline-padding, 1px 4px);
    }

    /*
     * A hottext never shows the native radio/checkbox box — every theme variant draws selection on
     * the word itself. The control stays in the tree for the accessibility mapping, out of the flow.
     *
     * This was three identical '::part(control) { display: none }' rules in the theme, one per
     * variant, under a fourth that had already hidden it unconditionally.
     */
    [part='control'] {
      display: none;
    }
  `
];
