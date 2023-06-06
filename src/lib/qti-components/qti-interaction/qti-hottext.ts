import { customElement } from 'lit/decorators.js';
import { QtiChoice } from './internal/choice/qti-choice';
import { html } from 'lit';

@customElement('qti-hottext')
export class QtiHottext extends QtiChoice {
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
