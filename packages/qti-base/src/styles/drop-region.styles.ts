import { css } from 'lit';

/**
 * The `drop` region of every drop target.
 *
 * One rule: **a drop container hosts a chip, it never sizes one.** No `flex: 1`, no stretch, no
 * centring. The chip's box is decided by the chip — in the drag bank, mid-flight as a clone, and
 * once dropped — and a container that centres or stretches it makes the drop the one place where
 * that stops being true. That is felt as the chip jumping the instant it lands.
 *
 * `flex: 0 0 auto` on the children says "intrinsic size, no growing, no shrinking".
 * `align-items: flex-start` stops the cross axis stretching them, which is the flex default and
 * the reason a chip in a tall dropzone used to grow to fill it.
 *
 * A container that wants a *minimum* size still declares one (see `--qti-dropzone-min-*`). That
 * sizes the container, never its contents.
 *
 * Verified by drag-drop.invariance.spec.ts: "a chip is the same chip wherever it lives".
 */
export const dropRegion = css`
  [part~='drop'] {
    /*
     * The one deliberate opt-out from the border-box reset.
     *
     * --qti-dropzone-min-* is the border-box of the largest chip, and what has to hold that chip is
     * this region's *content* area. Under border-box a theme's dashed drop border is subtracted
     * from the chip's own size, the content comes up short, and the drop grows the moment a chip
     * lands in it. Order's drop did exactly that: 64px empty, 66px full, for a 1px border.
     */
    box-sizing: content-box;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
    gap: var(--qti-drop-gap, 0);
    /* Containing block for anything a theme draws over the drop. Was 'position: relative' in the
       theme's 'drop' mixin, which put a document stylesheet in charge of a shadow node's position. */
    position: relative;
  }

  [part~='drop'] > * {
    flex: 0 0 auto;
    align-self: flex-start;
  }
`;
