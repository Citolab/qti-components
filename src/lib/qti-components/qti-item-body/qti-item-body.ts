import { customElement } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import styles from './qti-item-body.styles';
import type { CSSResultGroup } from 'lit';

/**
 * @summary The qti-item-body node contains the text, graphics, media objects and interactions that describe the item's content and information about how it is structured.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.sphpo6lu6zqi
 * @status stable
 * @since 4.0
 *
 * @slot - item body content.
 * @slot qti-rubric-block - the qti rubric block is placed above the item
 *
 */
@customElement('qti-item-body')
export default class QtiItemBody extends LitElement {
  static styles: CSSResultGroup = styles;

  override render() {
    return html`<slot name="qti-rubric-block"></slot><slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item-body': QtiItemBody;
  }
}
