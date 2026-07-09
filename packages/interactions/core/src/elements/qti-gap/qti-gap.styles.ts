import { css } from 'lit';

export default css`
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
    min-height: var(--qti-dropzone-min-height, 0);
    min-width: var(--qti-dropzone-min-width, 0);
  }
`;
