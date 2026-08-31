import { LitElement, html } from 'lit';

import styles from './qti-position-object-interaction.styles';

import type { CSSResultGroup } from 'lit';

/**
 * Position-object interaction: candidates place draggable objects onto a stage image.
 *
 * @slot - Default slot for the object choices and stage.
 */
export class QtiPositionObjectInteraction extends LitElement {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<slot></slot>`;
  }
}
