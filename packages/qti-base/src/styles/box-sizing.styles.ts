import { css } from 'lit';

/**
 * The border-box reset, for shadow trees.
 *
 * `modern-normalize` applies `*, ::before, ::after { box-sizing: border-box }` to the document,
 * but a universal selector never crosses a shadow boundary: every shadow root starts over at
 * the UA default, `content-box`. So each component has to opt in, and until now 15 of them did
 * so ad hoc — one of them with `content-box`, one with `!important`.
 *
 * Why this matters beyond tidiness: under `content-box`, padding and border are *size*. A rule
 * that only means to repaint a chip — `:state(dragging) { border: none }` — silently shrinks it
 * by two pixels per axis, the drag bank rewraps, and a drop target slides out from under the
 * user's pointer mid-drag. Border-box is what makes "a state may repaint but never re-lay-out"
 * a rule the CSS can actually keep.
 *
 * `:host` is set explicitly and descendants inherit, so a component that genuinely needs
 * `content-box` for a subtree (an image map, say) can opt out at one node and have it hold for
 * everything below it.
 */
export const boxSizing = css`
  :host {
    box-sizing: border-box;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
`;
