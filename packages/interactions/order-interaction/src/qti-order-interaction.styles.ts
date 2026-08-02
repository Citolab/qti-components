import { css } from 'lit';

import { boxSizing, dropRegion, validationMessage } from '@qti-components/base';

/**
 * Layout and sizing only. Paint and state live in the theme.
 *
 * What left, and where it went — `styles/qti-theme/interactions/qti-order-interaction.css` and
 * `styles/overrides/kennisnet/qti/order-interaction.scss`:
 *
 *   [part~='drop'][active] / [enabled]     -> ::part(active) / ::part(enabled)
 *   [part~='drop']:has([part='drag'])      -> ::part(filled)
 *
 * They had to be rewritten, not relocated: an attribute selector and `:has()` cannot follow
 * `::part()`, so the drop's flags became part tokens (verified in Chromium, see setDropFlag).
 *
 * Two rules were deleted rather than moved, because neither did anything:
 *   - `background-color: var(--qti-background-color-active-droplist)` — that property is never
 *     defined anywhere in the repo, so the declaration was invalid at computed-value time.
 *   - `[part~='drop'][data-cross-slot-target]` — nothing has ever set that attribute.
 */
export default [
  boxSizing,
  validationMessage,
  dropRegion,
  css`
    /* The box this element already had. See the note in qti-match-interaction.styles.ts. */
    :host {
      display: block;
    }

    [part='drags'] {
      display: flex;
      align-items: flex-start;
      flex: 1;
      flex-wrap: wrap;
    }

    [part='drops'] {
      flex: 1;
      display: grid;
      grid-auto-flow: row;
      /*
       * A column floor and a drop's own min-width are two jobs, and this asks for both by name
       * rather than letting one token mean both. --qti-drop-track-min-width is the policy: a column
       * stays usable however narrow the chips are. --qti-dropzone-min-width is the measurement: a
       * column is never narrower than the chip it holds. max() of the two is what the grid wants,
       * and the 0px fallback is what makes this correct for an interaction that never measures.
       *
       * One name did both until --qti-drop-min-width was deleted for exactly that (it meant the
       * track floor here and a drop's own min-width in the match target). Folding the track back
       * onto --qti-dropzone-min-width brought the conflation back: a theme setting it to give
       * unmeasured drops a floor also set every column, and a code path that stopped publishing a
       * measured width stopped meaning "no floor".
       */
      grid-template-columns: repeat(
        auto-fit,
        minmax(max(var(--qti-drop-track-min-width, 120px), var(--qti-dropzone-min-width, 0px)), 1fr)
      );
      gap: 0.5rem;
    }

    :host([orientation='horizontal']) [part='drags'],
    :host(.qti-orientation-horizontal) [part='drags'] {
      flex-direction: row;
    }
    /*
     * Horizontal adds nothing to [part='drops']: the base rule above is already the horizontal
     * layout — auto-fit columns that wrap. Only 'vertical' overrides it, to a single column.
     *
     * There used to be a 'grid-auto-flow: column' here, which forced every drop onto one
     * non-wrapping line. The theme cancelled it by restating the base rule at
     * qti-order-interaction.css, but only for '[orientation='horizontal']' — so the attribute
     * wrapped and the '.qti-orientation-horizontal' class did not. The theme's rule is gone and so
     * is this one; both spellings now wrap, which is what the attribute already did.
     */
    :host([orientation='vertical']) [part='drags'],
    :host(.qti-orientation-vertical) [part='drags'] {
      flex-direction: column;
    }
    :host([orientation='vertical']) [part='drops'],
    :host(.qti-orientation-vertical) [part='drops'] {
      grid-template-columns: 1fr;
    }

    /* Drop target. The interaction measures its chips and publishes the result as a custom
     property on its host; the property itself lives here, not in a style attribute. */
    [part~='drop'] {
      display: block;
      flex: 1;
      min-height: var(--qti-dropzone-min-height, 0);

      /*
       * Both axes, not just the height.
       *
       * The width was measured and published all along and then thrown away: the drop is a grid item
       * and stretched to its track, which is 1fr, so a slot in the vertical layout came out 669px
       * wide for a 149px chip. justify-self: start stops the stretch and the measured minimum then
       * decides, so a slot is exactly as wide as the widest chip — the same rule the height has
       * always followed.
       *
       * The grid is untouched: the tracks still lay the slots out and still wrap in the horizontal
       * layout. Only the slot inside the track stops filling it.
       */
      min-width: var(--qti-dropzone-min-width, 0);
      justify-self: start;

      /* A chip's drop shadow hangs outside its column. */
      overflow: visible;
    }

    [part='drops'] {
      overflow: visible;
    }

    /* Once a drop holds a chip it stops stretching to the row and sits at the top of it. */
    :host(:has(qti-simple-choice)) [part~='drop'] {
      align-self: flex-start;
    }

    /*
     * The chip a drop renders.
     *
     * 'overflow: visible', not 'hidden'. The theme declared both, in two '::part(drag)' blocks at
     * equal specificity in the same layer, so the later one won and the chip has always been
     * unclipped. The 'text-overflow: ellipsis' still sitting beside the first one has therefore
     * never done anything; it is left in the theme rather than deleted here, since removing it is a
     * decision about how a long label should behave, not a relocation.
     */
    [part~='drag'] {
      display: flex;
      align-items: center;
      overflow: visible;
    }

    [part='container'] {
      display: grid;
      grid-template-areas:
        'drags drops'
        'message message';
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-items: start;
      gap: 0.5rem;
    }

    slot[part~='drags'] {
      grid-area: drags;
    }

    [part='drops'] {
      grid-area: drops;
    }

    [part='message'] {
      grid-area: message;
      width: 100%;
      justify-self: start;
    }

    /*
     * The PLATFORM DEFAULT for container positioning, when the orientation is horizontal.
     *
     * Read that carefully, because the two things are separate axes in QTI 3 and this rule does not
     * merge them. Vocabulary §1.2.9.3 defines qti-choices-* as where the choices container sits
     * relative to the order-target container; orientation is how items flow WITHIN a container.
     * They compose: §1.2.9.2 Figure 73 is orientation="vertical" class="qti-choices-left" and
     * renders two COLUMNS SIDE BY SIDE — vertical does not stack the containers, and horizontal does
     * not imply that it should.
     *
     * What makes this rule legitimate is that §1.2.9.3 declines to specify the positioning at all
     * when no class is given: "In the absence of choices | order target container positioning,
     * delivery systems should render platform defaults." That default is ours, and for a horizontal
     * flow the useful one is stacked, because a row needs the width. An author who wants something
     * else says so with qti-choices-*, which is exactly what the spec provides it for — and those
     * rules below still win (see the source-order note).
     *
     * Side by side used to work here anyway, but only because a slot could be narrower
     * than the chip standing in it: the theme gave a placed chip width: 100%, so a 218px chip was
     * squeezed into a 184px track and three of them fitted in half the width. That squeeze is gone
     * (DROP-SIZING.md §5), and without it "van links naar rechts" collapsed to a single column,
     * because 384px cannot hold two 218px chips.
     *
     * Measured on ITEM013: side by side gives the slots 384px and one 384px track; stacked gives them
     * 800px and three 256px tracks, each wider than the chip. Vertical is untouched — one column is
     * what it wants, and the split suits it.
     *
     * Deliberately BEFORE the qti-choices-* rules below, not after. Those tie on specificity, so
     * source order decides: an author who writes qti-choices-left still gets it, and this is only the
     * default for an orientation that has no such class.
     */
    :host([orientation='horizontal']) [part='container'],
    :host(.qti-orientation-horizontal) [part='container'] {
      grid-template-areas:
        'drags'
        'drops'
        'message';
      grid-template-columns: minmax(0, 1fr);
    }

    :host(.qti-choices-top) [part='container'] {
      grid-template-areas:
        'drags'
        'drops'
        'message';
      grid-template-columns: minmax(0, 1fr);
    }

    :host(.qti-choices-bottom) [part='container'] {
      grid-template-areas:
        'drops'
        'drags'
        'message';
      grid-template-columns: minmax(0, 1fr);
    }

    :host(.qti-choices-left) [part='container'] {
      grid-template-areas:
        'drags drops'
        'message message';
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    :host(.qti-choices-right) [part='container'] {
      grid-template-areas:
        'drops drags'
        'message message';
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }

    /* An answer key shows the answer, not the bank you would have dragged it from. The attribute is
       set on the clone by the correct-response mixin; the theme used to do this with a
       '.full-correct-response' descendant selector, from the document. */
    :host([answer-key]) [part~='drags'] {
      display: none;
    }
  `
];
