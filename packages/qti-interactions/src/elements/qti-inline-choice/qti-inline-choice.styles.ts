import { css } from 'lit';

import type { CSSResultGroup } from 'lit';

const styles: CSSResultGroup = css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  slot {
    display: inline;
  }
`;

export default styles;
