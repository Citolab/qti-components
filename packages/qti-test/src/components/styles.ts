// /* eslint-disable lit-plugin(no-invalid-css) */
import { css, html } from 'lit';

/*
 * The resting look of the test controls (next, prev, item/section links, TTS buttons).
 *
 * Two looks, both plain: a neutral one (the page's surface, the theme's border, the surrounding text
 * colour) and a filled one that `test-next` wears, in the theme's neutral colour with its content
 * colour on top. No shadow, no glow, no transition, so the controls read as unbranded until a host
 * repaints them.
 *
 * Every colour is the theme's tier 1 (CONTRACT.md §8 in qti-theme), with a CSS system colour behind
 * it for a page that loads no theme: Canvas and CanvasText follow the page's color-scheme, so the
 * controls stay legible in dark mode without the theme too. Hover and press mix the content colour
 * into the fill, by --qti-hover-mix and --qti-active-mix.
 *
 * Paint comes from the `--test-button-*` slots, which repaint the test controls alone, and never
 * from the shared `--qti-component-*` tokens: those also paint the items' own borders, and a change
 * to how a button looks must not move an interaction.
 *
 *   --test-button-background-color, --test-button-color, --test-button-border-color,
 *   --test-button-hover-background-color, --test-button-active-background-color
 *                                                  the neutral look, and the filled look's slots
 *   --test-button-primary-background-color, --test-button-primary-color,
 *   --test-button-primary-hover-background-color, --test-button-primary-active-background-color
 *                                                  the filled look only
 */

const surface = css`var(--qti-color-base-100, var(--cito-color-base-100, Canvas))`;
const content = css`var(--qti-color-base-content, var(--cito-color-base-content, CanvasText))`;
const neutral = css`var(--qti-color-neutral, var(--cito-color-neutral, CanvasText))`;
const neutralContent = css`var(--qti-color-neutral-content, var(--cito-color-neutral-content, Canvas))`;

/*
 * A test control is drawn on an inner element (`.control`, part "button"), never on its host.
 *
 * A page's reset, Tailwind's preflight for one (`*, ::before, ::after { margin: 0; padding: 0; border: 0 solid }`),
 * is a rule of the page, and a page rule beats the `:host` rules of a shadow root whatever its layer or its
 * specificity. A control that paints its padding and border on the host loses them to such a reset. The
 * inner element lives in the shadow tree, where the page's `*` does not reach, so the control looks the same with
 * or without a reset. The host keeps only what a reset leaves alone: its display, the radius its focus ring
 * follows, and the cursor.
 */
export const hostBox = css`
  display: inline-flex;
  cursor: pointer;
  user-select: none;
  border-radius: var(--test-button-border-radius, var(--qti-radius-field, var(--cito-radius-field, 0.2rem)));
`;

/** The box of the control itself: the inner element. */
export const form = css`
  display: flex;
  flex: 1 1 auto;
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
  border-radius: var(--test-button-border-radius, var(--qti-radius-field, var(--cito-radius-field, 0.2rem)));
`;

export const btn = css`
  ${form};
  background-color: var(--test-button-background-color, ${surface});
  color: var(--test-button-color, inherit);
  border: var(--qti-border-width, var(--cito-border-width, 1px)) solid
    var(--test-button-border-color, var(--qti-border-color, color-mix(in oklab, ${content} 45%, ${surface})));
`;

/** The filled look: the neutral colour, its content colour on top. Same box as `btn`, so the two sit level. */
export const btnPrimary = css`
  background-color: var(--test-button-primary-background-color, ${neutral});
  color: var(--test-button-primary-color, ${neutralContent});
  border-color: var(--test-button-primary-background-color, ${neutral});
`;

/** Hover; paint only, so the box never moves. */
export const btnInteractive = css`
  background-color: var(
    --test-button-hover-background-color,
    color-mix(in oklab, ${surface}, ${content} var(--qti-hover-mix, 8%))
  );
`;

export const btnPrimaryInteractive = css`
  background-color: var(
    --test-button-primary-hover-background-color,
    color-mix(in oklab, ${neutral}, ${neutralContent} var(--qti-hover-mix, 8%))
  );
`;

/** Pressed: the same mix, twice as far. Paint only, so a click never moves the button. */
export const btnActive = css`
  background-color: var(
    --test-button-active-background-color,
    color-mix(in oklab, ${surface}, ${content} var(--qti-active-mix, 16%))
  );
`;

export const btnPrimaryActive = css`
  background-color: var(
    --test-button-primary-active-background-color,
    color-mix(in oklab, ${neutral}, ${neutralContent} var(--qti-active-mix, 16%))
  );
`;

/** The theme's one focus ring (qti-theme `@mixin foc`), so a page shows one kind of ring. */
export const focusRing = css`
  outline: var(--qti-focus-border-width, 2px) solid var(--qti-focus-color, Highlight);
  outline-offset: var(--qti-focus-offset, 2px);
`;

export const dis = css`
  cursor: not-allowed;
  opacity: 0.45;
`;

export const ind = css`
  ${form};
  border: var(--qti-border-width, var(--cito-border-width, 1px)) solid var(--qti-border-color, GrayText);
`;

/** What a test control renders: the inner element that carries the look (see `hostBox`). */
export const control = html`<span class="control" part="button"><slot></slot></span>`;

/**
 * The stylesheet of a neutral test control: the host box, the look on `.control`, and its hover, press,
 * focus and disabled states. A control with its own content (a bookmark's icon) adds to it.
 */
export const button = css`
  :host {
    ${hostBox};
  }
  .control {
    ${btn};
  }
  @media (hover: hover) and (pointer: fine) {
    :host(:hover:not([disabled])) .control {
      ${btnInteractive};
    }
  }
  :host(:active:not([disabled])) .control {
    ${btnActive};
  }
  :host(:focus-visible) {
    ${focusRing};
  }
  :host([disabled]) {
    ${dis};
  }
  :host([disabled]) .control {
    cursor: not-allowed;
  }
`;

/** The filled look of `test-next`: add after `button`, so its rules win at equal specificity. */
export const buttonPrimary = css`
  .control {
    ${btnPrimary};
  }
  @media (hover: hover) and (pointer: fine) {
    :host(:hover:not([disabled])) .control {
      ${btnPrimaryInteractive};
    }
  }
  :host(:active:not([disabled])) .control {
    ${btnPrimaryActive};
  }
`;
