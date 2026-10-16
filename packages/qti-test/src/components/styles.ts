// /* eslint-disable lit-plugin(no-invalid-css) */
import { css } from 'lit';

/*
 * The resting look of the test controls (next, prev, item/section links, TTS buttons).
 *
 * Two looks, both plain: a neutral one (white, thin gray border, the surrounding text colour) and a
 * primary one (solid dark, white text) that `test-next` wears. No shadow, no glow, no transition,
 * so the controls read as unbranded until a host repaints them.
 *
 * Paint comes from the `--test-button-*` slots, which repaint the test controls alone, and
 * never from the shared `--qti-component-*` tokens: those also paint the items' own borders, and
 * a change to how a button looks must not move an interaction.
 *
 *   --test-button-background-color, --test-button-color, --test-button-border-color,
 *   --test-button-hover-background-color       the neutral look, and the primary look's slots
 *   --test-button-primary-background-color, --test-button-primary-color,
 *   --test-button-primary-hover-background-color   the primary look only
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
  background-color: var(--test-button-background-color, #fff);
  color: var(--test-button-color, inherit);
  border: 1px solid var(--test-button-border-color, #8a929a);
`;

/** The primary look: solid dark with white text. Same box as `btn`, so the two sit level. */
export const btnPrimary = css`
  background-color: var(--test-button-primary-background-color, #111);
  color: var(--test-button-primary-color, #fff);
  border-color: var(--test-button-primary-background-color, #111);
`;

/** Hover and keyboard focus; paint only, so the box never moves. */
export const btnInteractive = css`
  background-color: var(--test-button-hover-background-color, #f3f4f6);
`;

export const btnPrimaryInteractive = css`
  background-color: var(--test-button-primary-hover-background-color, #333);
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
