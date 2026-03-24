import { html, LitElement } from 'lit';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';
import styles from './qti-hottext.styles';

import type { CSSResultGroup } from 'lit';

export class QtiHottext extends ActiveElementMixin(LitElement, 'qti-hottext') {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<div part="ch"><div part="cha"></div></div>
      <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hottext': QtiHottext;
  }
}
