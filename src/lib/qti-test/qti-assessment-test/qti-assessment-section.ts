import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('qti-assessment-section')
export class QtiAssessmentSection extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;
  render() {
    return html`<slot name="qti-rubric-block"></slot><slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-assessment-section': QtiAssessmentSection;
  }
}
