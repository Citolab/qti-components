import { css, LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * @summary The qti-context-declaration element declares context variables for an item.
 * @documentation https://www.imsglobal.org/spec/qti/v3p0/impl#h.qti-context-declaration
 */
@customElement('qti-context-declaration')
export class QtiContextDeclaration extends LitElement {
  @property({ type: String }) identifier: string = '';
  @property({ type: String }) cardinality: 'single' | 'multiple' | 'ordered' | 'record' = 'record';

  static override styles = [
    css`
      :host {
        display: none;
      }
    `
  ];

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-context-declaration': QtiContextDeclaration;
  }
}
