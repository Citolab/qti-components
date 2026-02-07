import { css } from 'lit';

import type { CSSResultGroup } from 'lit';

const styles: CSSResultGroup = css`
  :host {
    display: inline-block;
    vertical-align: baseline;
    position: relative;
  }

  /* --- Fallback custom listbox (for browsers without customizable select) --- */
  button[part='trigger'] {
    font: inherit;
    color: inherit;
    background-color: var(--qti-bg, white);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
    border: var(--qti-border-thickness, 2px) var(--qti-border-style, solid) var(--qti-border-color, #c6cad0);
    border-radius: var(--qti-border-radius, 0.3rem);
    padding: 0.25rem 0.75rem;
    min-width: var(--qti-calculated-min-width, auto);
    anchor-name: --qti-inline-choice-trigger;
  }

  [part='value'] {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  [part='dropdown-icon'] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    transition: transform 150ms ease;
    transform-origin: 50% 50%;
    color: var(--qti-border-color, #c6cad0);
    font-size: 1.75em;
    line-height: 1;
  }

  button[part='trigger'][aria-expanded='true'] [part='dropdown-icon'] {
    transform: rotate(180deg);
    color: var(--qti-border-active, #f86d70);
  }

  button[part='trigger'][disabled] {
    cursor: not-allowed;
    opacity: 0.6;
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

    overflow: auto;
    background-color: var(--qti-bg, white);
    border: var(--qti-border-thickness, 2px) var(--qti-border-style, solid) var(--qti-border-color, #c6cad0);
    border-radius: var(--qti-border-radius, 0.3rem);

    padding: 4px;
    box-sizing: border-box;
    position-try-fallbacks: flip-block, flip-inline;
  }

  button[part='option'] {
    font: inherit;
    color: inherit;
    background-color: transparent;
    border: 0;
    padding: 0.5rem 0.5rem;
    width: 100%;
    text-align: left;
    border-radius: calc(var(--qti-border-radius, 0.3rem) - 2px);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.25;
    min-height: 2.25rem;
  }

  ::slotted(qti-inline-choice) {
    font: inherit;
    color: inherit;
    display: block;
    background-color: transparent;
    border: 0;
    padding: 0.5rem 0.5rem;
    width: 100%;
    text-align: left;
    border-radius: calc(var(--qti-border-radius, 0.3rem) - 2px);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.25;
    min-height: 2.25rem;
    box-sizing: border-box;
  }

  button[part='option'][aria-selected='true'] {
    background-color: var(--qti-bg-active, #ffecec);
  }

  ::slotted(qti-inline-choice[aria-selected='true']) {
    background-color: var(--qti-bg-active, #ffecec);
  }

  button[part='option']:hover {
    background-color: var(--qti-hover-bg, #f9fafb);
  }

  ::slotted(qti-inline-choice:hover) {
    background-color: var(--qti-hover-bg, #f9fafb);
  }

  button[part='option']:focus-visible {
    outline: 2px solid var(--qti-border-active, #f86d70);
    outline-offset: 2px;
  }

  ::slotted(qti-inline-choice:focus-visible) {
    outline: 2px solid var(--qti-border-active, #f86d70);
    outline-offset: 2px;
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

  select[part='select'] img,
  button[part='option'] img,
  button[part='trigger'] img,
  [part='menu'] img {
    display: inline-block;

    vertical-align: middle;
  }
`;

export default styles;
