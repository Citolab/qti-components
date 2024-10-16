import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ChoiceMixin } from './internal/choice/choice.mixin';

@customElement('qti-hottext')
export class QtiHottext extends ChoiceMixin(LitElement, 'qti-hottext') {
  static styles = css`
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
