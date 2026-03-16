import { LitElement, html } from 'lit';

import styles from './qti-position-object-interaction.styles';

import type { CSSResultGroup } from 'lit';

export class QtiPositionObjectInteraction extends LitElement {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<slot></slot>`;
  }
}
