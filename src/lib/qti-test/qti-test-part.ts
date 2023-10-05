/* eslint-disable wc/no-invalid-element-name */

import { html, LitElement } from 'lit';

import { customElement, property, query, state } from 'lit/decorators.js';

@customElement('qti-test-part')
export class QtiTestPart extends LitElement {
  @property({ type: String, attribute: 'navigation-mode' })
  private _navigationMode: 'linear' | 'nonlinear' = 'linear';

  // public set itemResponse(val: ResponseInteraction[]) {
  //   if (this._itemRef) {
  //     this._itemRef.responses = val;
  //     if (this._navigationMode === NavigationMode.linear) {
  //       this._itemRef.style.filter = 'blur(5px)';
  //       this._itemRef.setAttribute('disabled', '');
  //       this.dispatchEvent(new CustomEvent('test-lineair-item-already-done'));
  //     }
  //   }
  // }

  override render() {
    return html`
      <slot name="qti-item"></slot>
      <slot> </slot>
    `;
  }
}
