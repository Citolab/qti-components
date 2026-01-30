import { css, html, LitElement } from 'lit';

import { ActiveElementMixin } from '../../mixins/active-element/active-element.mixin';
export class QtiHottext extends ActiveElementMixin(LitElement, 'qti-hottext') {
  static override styles = css`
    :host {
      display: flex;
      user-select: none;
    }
  `;

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
