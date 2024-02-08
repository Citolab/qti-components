import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('qti-companion-materials-info')
export class QtiCompanionMaterialsInfo extends LitElement {
  // static override styles = css`
  //   slot {
  //     display: hidden;
  //   }
  // `;
  // override render() {
  //   return html` <slot></slot> `;
  // }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-companion-materials-info': QtiCompanionMaterialsInfo;
  }
}
