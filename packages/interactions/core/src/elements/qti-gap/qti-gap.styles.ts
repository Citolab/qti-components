import { css } from 'lit';

import { boxSizing } from '@qti-components/base';

export default [
  boxSizing,
  css`
    /*
   * A drop target. The interaction measures its chips and publishes the result as custom
   * properties on its own host; the actual CSS properties live here, not in a style attribute.
   *
   * --qti-dropzone-width is only set when the item authors data-choices-container-width, and
   * it arrives with --qti-dropzone-min-width: 0 — otherwise the measured min-width would win
   * over the authored width, since min-width beats width.
   */
    :host {
      display: flex;
      user-select: none;
    }

    /*
   * The chip's box is reserved on the slot, not on the host.
   *
   * --qti-dropzone-min-* is the border-box of the widest and tallest chip, so whatever carries
   * that minimum must have no border or padding of its own — otherwise the theme's dashed gap
   * border eats into the reservation, the gap comes up short, and it grows the instant a chip
   * lands in it. That reflows the sentence and drags the neighbouring gaps sideways while the
   * user is still on their way to one.
   *
   * It cannot live on :host. A theme's universal reset matches the host element from the
   * document, and document rules outrank :host — so the host is border-box no matter what this
   * file says. The slot is inside the shadow tree, out of the document's reach, and inherits
   * border-box harmlessly since it has no border or padding of its own.
   */
    slot[name='drags'] {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: var(--qti-dropzone-min-height, 0);
      min-width: var(--qti-dropzone-min-width, 0);
    }
  `
];
