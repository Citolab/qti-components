import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { QtiChoice } from './internal/choice/qti-choice';

@customElement('qti-hottext')
export class QtiHottext extends QtiChoice {
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
