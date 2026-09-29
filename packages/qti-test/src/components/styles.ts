// /* eslint-disable lit-plugin(no-invalid-css) */
import { css } from 'lit';

/*
 * The resting look of the test controls (next, prev, item/section links, TTS buttons).
 *
 * Paint reads the qti-theme tokens, so a theme or brand that re-values them repaints the test
 * chrome along with the items; every token has a literal fallback equal to the theme's own
 * default, so the controls look the same without qti-theme loaded. A `--test-button-*` slot
 * in front of each token repaints the test controls alone.
 */

export const form = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375em;
  box-sizing: border-box;
  min-block-size: var(--test-button-size, 2.25rem);
  padding: 0 0.875rem;
  font: inherit;
  line-height: 1.25;
  cursor: pointer;
  user-select: none;
  border-radius: var(--test-button-border-radius, var(--qti-component-border-radius, 0.2rem));
`;

export const btn = css`
  ${form};
  background-color: var(--test-button-background-color, var(--qti-component-background-color, #fff));
  color: var(--test-button-color, var(--qti-component-color, inherit));
  border: var(--qti-component-border-width, 1px) var(--qti-component-border-style, solid)
    var(--test-button-border-color, var(--qti-component-border-color, #0175aa));
`;

/** Hover and keyboard focus; paint only, so the box never moves. */
export const btnInteractive = css`
  background-color: var(--test-button-hover-background-color, var(--qti-bg-active, #f2f8fb));
`;

export const focusRing = css`
  outline: var(--qti-focus-border-width, 2px) solid var(--qti-focus-color, #007ac3);
  outline-offset: 2px;
`;

export const dis = css`
  cursor: not-allowed;
  opacity: 0.45;
`;

export const ind = css`
  ${form};
  border: 1px solid gray;
`;
