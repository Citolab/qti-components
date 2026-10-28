import { LitElement, html } from 'lit';

import styles from './qti-position-object-stage.styles';

import type { CSSResultGroup } from 'lit';

/**
 * The stage of one or more position object interactions: the image the objects are placed on, and
 * the containing block of their placed copies. Layout only: each `qti-position-object-interaction`
 * inside it handles its own input and response, measured against this stage's image.
 *
 * @customElement qti-position-object-stage
 * @slot - The stage image (`img` or `picture`), then the interactions.
 */
export class QtiPositionObjectStage extends LitElement {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-position-object-stage': QtiPositionObjectStage;
  }
}
