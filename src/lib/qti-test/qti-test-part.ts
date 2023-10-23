/* eslint-disable wc/no-invalid-element-name */

import { html, LitElement } from 'lit';

import { customElement, property, query, state } from 'lit/decorators.js';

@customElement('qti-test-part')
export class QtiTestPart extends LitElement {
  @property({ type: Boolean, reflect: true }) loading: boolean = false;

  @property({ type: String, attribute: 'navigation-mode' })
  private _navigationMode: 'linear' | 'nonlinear' = 'linear';

  override render() {
    return html`
      <slot name="qti-item"></slot>
      <slot> </slot>
    `;
  }
}
