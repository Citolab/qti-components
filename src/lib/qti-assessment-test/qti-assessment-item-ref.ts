import { customElement, property } from 'lit/decorators.js';
import { QtiItem } from '../qti-item';
import { html } from 'lit';

@customElement('qti-assessment-item-ref')
export class QtiAssessmentItemRef extends QtiItem {
  @property({ type: String }) identifier: string;
  @property({ type: String }) href: string;

  connectedCallback(): void {
    super.connectedCallback();
    const event = new CustomEvent('register-qti-assessment-item-ref', {
      bubbles: true,
      composed: true,
      detail: { identifier: this.identifier, href: this.href }
    });
    this.dispatchEvent(event);
  }
}
