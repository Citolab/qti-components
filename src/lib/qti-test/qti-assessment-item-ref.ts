import { customElement, property } from 'lit/decorators.js';
import { QtiItem } from '../qti-item';

@customElement('qti-assessment-item-ref')
export class QtiAssessmentItemRef extends QtiItem {
  @property({ type: String }) identifier: string;
  @property({ type: String }) href: string;
  // @property({ type: Boolean, reflect: true }) active: boolean = false;

  connectedCallback(): void {
    super.connectedCallback();
    const event = new CustomEvent('register-item-ref', {
      bubbles: true,
      composed: true,
      detail: { identifier: this.identifier, href: this.href }
    });
    this.dispatchEvent(event);
  }
}
