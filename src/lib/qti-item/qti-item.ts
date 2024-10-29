import type { QtiAssessmentItem } from '@citolab/qti-components/qti-components';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('qti-item')
export class QtiItem extends LitElement {
  @property({ type: String, reflect: true }) identifier?: string;
  @property({ type: String }) href?: string;

  @property({ type: Object, attribute: false })
  xmlDoc: DocumentFragment; // the XMLDocument

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  get assessmentItem(): QtiAssessmentItem | null {
    return this.renderRoot?.querySelector('qti-assessment-item');
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this.updateComplete;
    this.dispatchEvent(
      new CustomEvent('qti-item-connected', {
        bubbles: true,
        composed: true,
        detail: { identifier: this.identifier, href: this.href }
      })
    );
  }

  render() {
    return html`${this.xmlDoc}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'qti-item': QtiItem;
  }
}
