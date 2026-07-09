import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    :host {
      display: flex;
      user-select: none;
    }

    /*
   * This element is both a draggable chip and — in match-interaction's last match-set — a drop
   * target. Only the drop target takes the dropzone sizing, so key on the absence of
   * :state(drag), which the interaction sets on its chips from draggablesSelector.
   *
   * The interaction measures its chips and publishes the result as custom properties on its own
   * host; the properties themselves live here rather than in a style attribute.
   */
    :host(:not(:state(drag))) {
      min-height: var(--qti-dropzone-min-height, 0);
      min-width: var(--qti-dropzone-min-width, 0);
    }
    slot {
      width: 100%;
      display: block;
    }
    slot[name='qti-simple-associable-choice'] {
      width: auto;
    }
    /* The slot a dropped chip lands in — only on a drop target, never on a source chip, which has
     the same slot but leaves it empty. Was an inline min-height written from JS. */
    :host(:not(:state(drag))) slot[part~='drop'] {
      min-height: var(--qti-dropzone-min-height, 0);
    }
  `
];
