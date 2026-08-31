import { css } from 'lit';

/**
 * The `drop` region of every drop target.
 *
 * One rule: **a drop container hosts a chip, it never sizes one.** No `flex: 1`, no stretch, no
 * centring. The chip's box is decided by the chip — in the drag bank, mid-flight as a clone, and
 * once dropped — and a container that centres or stretches it makes the drop the one place where
 * that stops being true. That is felt as the chip jumping the instant it lands.
 *
 * `flex: 0 1 auto` on the children says "intrinsic size, no growing, shrink if you must".
 * `align-items: flex-start` stops the cross axis stretching them, which is the flex default and
 * the reason a chip in a tall dropzone used to grow to fill it.
 *
 * The shrink half used to be 0 as well, on the reading that a drop must not resize a chip. It does
 * not say that. `flex-shrink: 0` does not preserve the chip's size, it preserves the chip's
 * UNCONSTRAINED max-content size — and those are the same number only while the bank is wide enough
 * to give the chip its full width. Once the bank is narrower, the bank chip (`flex: 0 1 auto`, like
 * any flex item) shrinks and wraps, the placed chip does not, and the two disagree.
 *
 * Measured on the order fixture, bank vs placed: 209x36 / 209x36 at a 480px interaction, but
 * 204x55 / 209x36 at 440px and 154x55 / 209x36 at 340px — the placed chip a fixed 209px wide,
 * overflowing a drop that had correctly reserved 156px for it. It reached CI as a font difference:
 * the same label measures ~227px under the Linux fonts, which puts 480px on the wrong side of the
 * boundary too.
 *
 * Shrinking cannot make a placed chip smaller than the reservation, because the reservation IS the
 * measured chip (`--qti-dropzone-min-*`, applied to this region's content box). So the floor a
 * shrink stops at is the chip's own size, which is the rule above, not an exception to it.
 * `flex-grow: 0` is what actually prevents the stretch this block cares about, and it is untouched.
 *
 * A container that wants a *minimum* size still declares one (see `--qti-dropzone-min-*`). That
 * sizes the container, never its contents.
 *
 * Verified by drag-drop.invariance.spec.ts: "a chip is the same chip wherever it lives" — including
 * the narrow-bank order fixture, which is there because the wide one passes either way.
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

    /*
     * No padding, and no token for one.
     *
     * A drop reserves --qti-dropzone-min-*, which is the chip's BORDER-box, as this region's CONTENT
     * area — so the chip already fits exactly, with nothing to spare and nothing squeezed. An inset
     * on top would only make the drop bigger than the thing it holds.
     *
     * There was a 1px one, to make the drop read as a frame a hair outside the chip. It never painted:
     * an EMPTY slot has nothing inside the inset to separate from, and a FILLED one hides its edge
     * (DROP-SIZING.md §4), so both states spent 2px on an invisible ring. The one drop that genuinely
     * wants breathing room — match's category card — declares padding on its own rule, which a
     * theme reaches with ::part(drop). A token in between bought nothing.
     */
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
    /* No gap either: 0 is the flex initial value, so the declaration only existed to host a token.
       A drop that wants space between chips sets gap on its own rule. */
    /* Containing block for anything a theme draws over the drop. Was 'position: relative' in the
       theme's 'drop' mixin, which put a document stylesheet in charge of a shadow node's position. */
    position: relative;
  }

  [part~='drop'] > * {
    flex: 0 1 auto;
    align-self: flex-start;
  }
`;
