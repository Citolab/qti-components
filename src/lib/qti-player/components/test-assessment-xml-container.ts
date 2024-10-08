import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('test-assessment-xml-container')
export class TestAssessmentXmlContainer extends LitElement {
  @property({ type: Object, attribute: false })
  xmlDoc: DocumentFragment; // the XMLDocument

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  render() {
    return html`${this.xmlDoc}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'test-assessment-xml-container': TestAssessmentXmlContainer;
  }
}
