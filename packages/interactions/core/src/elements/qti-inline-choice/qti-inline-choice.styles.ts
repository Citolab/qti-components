import { css } from 'lit';

import type { CSSResultGroup } from 'lit';

const styles: CSSResultGroup = css`
  /*
   * An option row: one line, clipped, with its text centred against the row's min-height. All four
   * were in the theme, set on this host from the document — which is also why the 'display: block'
   * this file declared never took effect.
   *
   * Block-level flex, not inline-flex. The rows are stacked by being full-width, but inline-level
   * rows still sit on ONE line in the menu's max-content pass, and the menu is a shrink-to-fit
   * popover: it came out as wide as all options side by side (measured: rows "vind" + "vindt" gave
   * a 107px menu under a 76px field). Block rows each start their own line, so the menu is as wide
   * as its widest row, or the field it anchors to.
   */
  :host {
    display: flex;
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
