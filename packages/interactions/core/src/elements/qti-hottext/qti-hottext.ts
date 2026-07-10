import { html, LitElement } from 'lit';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';
import styles from './qti-hottext.styles';

import type { CSSResultGroup } from 'lit';

export class QtiHottext extends ActiveElementMixin(LitElement, 'qti-hottext') {
  static override styles: CSSResultGroup = styles;

  override render() {
    return html`<div part="control"><div part="control-mark"></div></div>
      <slot part="label"></slot>
      <span part=${this.correctionPart} aria-hidden="true"></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-hottext': QtiHottext;
  }
}
