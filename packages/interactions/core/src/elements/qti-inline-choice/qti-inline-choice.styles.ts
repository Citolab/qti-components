import { css } from 'lit';

import type { CSSResultGroup } from 'lit';

const styles: CSSResultGroup = css`
  /*
   * An option row: one line, clipped, with its text centred against the row's min-height. All four
   * were in the theme, set on this host from the document — which is also why the 'display: block'
   * this file declared never took effect.
   */
  :host {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    box-sizing: border-box;
  }

  slot {
    display: inline;
  }
`;

export default styles;
