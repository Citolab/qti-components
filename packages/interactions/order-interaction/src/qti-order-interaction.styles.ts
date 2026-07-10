import { css } from 'lit';

import { boxSizing, dropRegion } from '@qti-components/base';

/**
 * Layout and sizing only. Paint and state live in the theme.
 *
 * What left, and where it went — `styles/qti-theme/interactions/qti-order-interaction.css` and
 * `styles/overrides/kennisnet/qti/order-interaction.scss`:
 *
 *   [part~='drop'][active] / [enabled]     -> ::part(active) / ::part(enabled)
 *   [part~='drop']:has([part='drag'])      -> ::part(filled)
 *   [part='drag']:state(candidate-*)       -> ::part(drag):state(candidate-*)
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

    :host([orientation='horizontal']) [part='drags'] {
      flex-direction: row;
    }
    :host([orientation='horizontal']) [part='drops'] {
      grid-auto-flow: column;
    }
    :host([orientation='vertical']) [part='drags'] {
      flex-direction: column;
    }
    :host([orientation='vertical']) [part='drops'] {
      grid-template-columns: 1fr;
    }

    /* Drop target. The interaction measures its chips and publishes the result as a custom
     property on its host; the property itself lives here, not in a style attribute. */
    [part~='drop'] {
      display: block;
      flex: 1;
      min-height: var(--qti-dropzone-min-height, 0);
    }

    [part='container'] {
      display: flex;
      gap: 0.5rem;
    }
    :host(.qti-choices-top) [part='container'] {
      flex-direction: column;
    }
    :host(.qti-choices-bottom) [part='container'] {
      flex-direction: column-reverse;
    }
    :host(.qti-choices-left) [part='container'] {
      flex-direction: row;
    }
    :host(.qti-choices-right) [part='container'] {
      flex-direction: row-reverse;
    }
  `
];
