import { css } from 'lit';

import type { CSSResultGroup } from 'lit';

const styles: CSSResultGroup = css`
  :host {
    display: inline-block;
    vertical-align: baseline;
    position: relative;
  }

  button[part='trigger'] {
    min-width: var(--qti-calculated-min-width, auto);
    anchor-name: --qti-inline-choice-trigger;
  }

  [part='value'] {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  [part~='dropdown-icon'] {
    line-height: 1;
  }

  [part='menu'] {
    position-anchor: --qti-inline-choice-trigger;
    inset: auto;
    margin: 0;
    z-index: 1000;
    top: calc(anchor(bottom) + 4px);
    left: anchor(left);
    min-width: anchor-size(width);
    max-width: min(90vw, 36rem);
    max-height: min(40vh, 20rem);
    position-try-fallbacks: flip-block, flip-inline;
  }

  button[part~='option'] {
    width: 100%;
  }

  [part='option-content'] {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  button[part~='option'] img,
  button[part='trigger'] img,
  [part='menu'] img {
    display: inline-block;
    vertical-align: middle;
  }
`;

export default styles;
