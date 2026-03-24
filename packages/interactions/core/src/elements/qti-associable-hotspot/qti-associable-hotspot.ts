import { LitElement, html } from 'lit';

import styles from './qti-associable-hotspot.styles';

import type { CSSResultGroup } from 'lit';

export class QtiAssociableHotspot extends LitElement {
  static override styles: CSSResultGroup = styles;

  override connectedCallback() {
    super.connectedCallback();
    this.dispatchEvent(
      new CustomEvent('qti-register-hotspot', {
        bubbles: true,
        composed: true,
        cancelable: false
      })
    );
  }

  override render() {
    return html` <slot name="drags"></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-associable-hotspot': QtiAssociableHotspot;
  }
}
