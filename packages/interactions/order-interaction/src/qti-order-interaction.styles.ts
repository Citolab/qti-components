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
      grid-template-columns: repeat(auto-fit, minmax(var(--qti-drop-min-width, 120px), 1fr));
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
